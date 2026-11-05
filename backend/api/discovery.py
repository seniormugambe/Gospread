import hashlib
import logging
import math

from django.utils import timezone

logger = logging.getLogger(__name__)

CONFIG_VERSION = "2.2-pilot-1"
DISCOVERY_WEIGHTS = {
    "relevance": 0.35,
    "quality": 0.25,
    "freshness": 0.15,
    "trust": 0.15,
    "exploration": 0.10,
}
QUALITY_POSITIVE = {
    "completion": 0.40,
    "save_share": 0.30,
    "return_viewer": 0.20,
    "amen": 0.10,
}
QUALITY_PENALTY = {
    "quick_exit": 0.35,
    "hide": 0.30,
    "credible_report": 0.20,
}
TRUST_WEIGHTS = {
    "verification": 0.20,
    "policy_compliance": 0.35,
    "follower_authenticity": 0.30,
    "stream_health": 0.15,
}
TRUST_WEIGHTS_NON_LIVE = {
    "verification": 0.20,
    "policy_compliance": 0.40,
    "follower_authenticity": 0.40,
}
COLD_START_ENABLED = True
COLD_START_WINDOW_DAYS = 14
COLD_START_MIN_QUALIFIED_VIEWS = 30
COLD_START_BASE = 0.10
COLD_START_MAX_BOOST = 0.20
FAIRNESS_ALLOCATION = 0.15
SEED_MAX_FOLLOWERS = 100
GROWING_MAX_FOLLOWERS = 1000
QUALIFIED_VIEW_SECONDS = 30

STANDING_WEIGHTS_CHURCH = {
    "follower_growth": 0.25,
    "engagement_depth": 0.30,
    "content_consistency": 0.25,
    "verified_artiste_affiliations": 0.10,
    "community_health": 0.10,
}
STANDING_WEIGHTS_ARTISTE = {
    "follower_growth": 0.20,
    "engagement_depth": 0.30,
    "release_consistency": 0.25,
    "media_catalog": 0.10,
    "community_health": 0.15,
}
STANDING_WEIGHTS_CREATOR = {
    "follower_growth": 0.25,
    "engagement_depth": 0.30,
    "qualified_referrals": 0.20,
    "consistency": 0.15,
    "community_health": 0.10,
}


def _validate_weights(name, weights):
    if not weights or any(not 0 <= value <= 1 for value in weights.values()):
        raise ValueError(f"{name} values must be between 0 and 1.")
    if not math.isclose(sum(weights.values()), 1.0, abs_tol=1e-9):
        raise ValueError(f"{name} must sum to 1.")


for _name, _weights in (
    ("DISCOVERY_WEIGHTS", DISCOVERY_WEIGHTS),
    ("QUALITY_POSITIVE", QUALITY_POSITIVE),
    ("TRUST_WEIGHTS", TRUST_WEIGHTS),
    ("TRUST_WEIGHTS_NON_LIVE", TRUST_WEIGHTS_NON_LIVE),
    ("STANDING_WEIGHTS_CHURCH", STANDING_WEIGHTS_CHURCH),
    ("STANDING_WEIGHTS_ARTISTE", STANDING_WEIGHTS_ARTISTE),
    ("STANDING_WEIGHTS_CREATOR", STANDING_WEIGHTS_CREATOR),
):
    _validate_weights(_name, _weights)

if any(not 0 <= value <= 1 for value in QUALITY_PENALTY.values()):
    raise ValueError("QUALITY_PENALTY values must be between 0 and 1.")


def _clamp(value):
    return max(0.0, min(1.0, value))


def _relevance(sermon, category, search):
    if search:
        terms = search.casefold().split()
        haystack = " ".join(
            [
                sermon.title,
                sermon.description,
                sermon.speaker,
                sermon.category,
                sermon.church.name,
                sermon.scripture_reference,
                " ".join(str(tag) for tag in sermon.tags if isinstance(tag, str)),
            ]
        ).casefold()
        return sum(term in haystack for term in terms) / len(terms)
    if category:
        return 1.0 if sermon.category.casefold() == category.casefold() else 0.0
    return 0.5


def _exploration(sermon_id, viewer_id, week):
    key = f"{viewer_id or 'anonymous'}:{week}:{sermon_id}".encode()
    value = int.from_bytes(hashlib.sha256(key).digest()[:8], "big")
    return value / (2**64 - 1)


def _metadata_completeness(sermon):
    fields = (
        sermon.title,
        sermon.description,
        sermon.speaker,
        sermon.category,
        sermon.tags,
        sermon.thumbnail_url,
    )
    return sum(bool(value) for value in fields) / len(fields)


def _qualified_view_count(sermon):
    return getattr(sermon, "qualified_view_count", 0) or 0


def rank_sermons(sermons, *, surface, category="", search="", viewer_id=None, now=None):
    now = now or timezone.now()
    if surface == "following":
        return sorted(
            sermons,
            key=lambda sermon: (sermon.published_at or sermon.created_at, sermon.created_at),
            reverse=True,
        )

    week = now.strftime("%Y-%W")
    ranked = []
    for sermon in sermons:
        relevance = _relevance(sermon, category, search)
        age_days = max(0.0, (now - (sermon.published_at or sermon.created_at)).total_seconds() / 86400)
        freshness = _clamp(1.0 - age_days / 30.0)
        quality = 0.5
        trust = 0.5
        exploration = _exploration(sermon.pk, viewer_id, week)
        score = _clamp(
            DISCOVERY_WEIGHTS["relevance"] * relevance
            + DISCOVERY_WEIGHTS["quality"] * quality
            + DISCOVERY_WEIGHTS["freshness"] * freshness
            + DISCOVERY_WEIGHTS["trust"] * trust
            + DISCOVERY_WEIGHTS["exploration"] * exploration
        )

        boost = 0.0
        if (
            COLD_START_ENABLED
            and age_days <= COLD_START_WINDOW_DAYS
            and _qualified_view_count(sermon) < COLD_START_MIN_QUALIFIED_VIEWS
            and relevance >= 0.3
            and sermon.category.casefold() != "prayer altar"
        ):
            boost = min(
                COLD_START_MAX_BOOST,
                COLD_START_BASE + 0.05 * _metadata_completeness(sermon) + 0.05 * 0.5,
            )
            logger.info(
                "Discovery cold-start prior applied config=%s sermon=%s",
                CONFIG_VERSION,
                sermon.pk,
            )

        follower_count = getattr(sermon, "follower_count", 0) or 0
        sermon._discovery_cold_start_prior_applied = boost > 0
        sermon._discovery_follower_count = follower_count
        sermon._discovery_is_fairness_slot = False
        sermon._discovery_is_fairness_filled = False
        ranked.append(
            {
                "sermon": sermon,
                "score": _clamp(score + boost),
                "is_small_account": follower_count <= GROWING_MAX_FOLLOWERS,
                "church_id": sermon.church_id,
            }
        )

    ranked.sort(key=lambda item: (item["score"], item["sermon"].pk), reverse=True)
    fairness_slots = int(len(ranked) * FAIRNESS_ALLOCATION)
    if fairness_slots == 0:
        return [item["sermon"] for item in ranked]

    result = []
    remaining = ranked.copy()
    reserved_positions = {
        math.ceil((index + 1) * len(ranked) / fairness_slots) - 1
        for index in range(fairness_slots)
    }
    for position in range(len(ranked)):
        selected = None
        if position in reserved_positions:
            selected = next(
                (
                    item
                    for item in remaining
                    if item["is_small_account"]
                ),
                None,
            )
        is_fairness_slot = position in reserved_positions
        is_fairness_filled = selected is not None
        if selected is None:
            selected = remaining[0]
        remaining.remove(selected)
        selected["sermon"]._discovery_is_fairness_slot = is_fairness_slot
        selected["sermon"]._discovery_is_fairness_filled = is_fairness_filled
        result.append(selected)

    return [item["sermon"] for item in result]
