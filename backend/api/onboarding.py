"""Onboarding fields per track, mirroring onboard.md. Answers feed the future recommendation algorithm."""
import re

from django.core.validators import URLValidator, validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

TEXT, TEXTAREA, URL, PHONE, EMAIL, SINGLE, LIST, URLS, LOCATIONS = (
    "text", "textarea", "url", "phone", "email", "single", "list", "urls", "locations",
)
MAX_ITEMS = 20

# Canonical artiste type values — stored lowercased for consistent querying.
ARTISTE_TYPE_OPTIONS = [
    "Worship leader", "Singer", "Rapper", "Choir", "Band",
    "Instrumentalist", "Spoken word", "Producer",
]

REGION_OPTIONS = [
    "Africa", "North America", "South America", "Europe",
    "Asia", "Middle East", "Oceania", "Caribbean",
]


def _f(key, label, kind, required=False, options=None, hint=""):
    return {"key": key, "label": label, "type": kind, "required": required, "options": options or [], "hint": hint}


QUESTIONS = {
    "ministry": [
        _f("ministry_name", "Ministry name", TEXT, True, hint="Official name of the church or ministry"),
        _f("description", "Ministry description", TEXTAREA, True, hint="Mission, focus, and activities"),
        _f("locations", "Locations", LOCATIONS, True, hint="Each branch: name, address and Google Maps link"),
        _f("senior_pastor", "Senior Pastor", TEXT, True, hint="Full name of the Senior Pastor or lead minister"),
        # Fix 3: dedicated website field alongside social links
        _f("website_url", "Ministry website", URL, hint="Official website, e.g. https://gracechurch.org"),
        _f("affiliated_artistes", "Affiliated artistes", LIST, hint="Gospel artistes associated with the ministry"),
        _f("social_links", "Social media links", URLS, hint="Facebook, Instagram, X, TikTok, YouTube, etc."),
        _f("phone", "Phone number", PHONE, True),
        _f("whatsapp", "WhatsApp number", PHONE),
        _f("email", "Official email", EMAIL, True),
    ],
    "artiste": [
        _f("stage_name", "Stage name", TEXT, True),
        # Fix 4: constrained single-choice instead of free-text list
        _f("artiste_type", "Artiste type", SINGLE, True, ARTISTE_TYPE_OPTIONS,
           hint="Choose the category that best describes you"),
        _f("genres", "Gospel genres", LIST, True, hint="Worship, Gospel hip-hop, Contemporary Gospel, Afro-gospel…"),
        _f("original_music", "Do you release original music?", SINGLE, True, ["Yes", "No"]),
        _f("ministry_affiliation", "Ministry affiliation", TEXT, hint="Church or ministry you are associated with"),
        # Fix 5: region field for artistes
        _f("region", "Region", SINGLE, True, REGION_OPTIONS, hint="Where you are primarily based"),
        _f("youtube_url", "YouTube link", URL),
        _f("instagram_url", "Instagram link", URL),
        _f("tiktok_url", "TikTok link", URL),
        _f("spotify_url", "Spotify link", URL),
        _f("other_music_urls", "Other music platforms", URLS, hint="Apple Music, Audiomack, Boomplay, Deezer…"),
        # Fix 1: booking email is now optional — required only if any booking field is filled
        _f("booking_name", "Booking contact name", TEXT),
        _f("booking_phone", "Booking phone", PHONE),
        _f("booking_whatsapp", "Booking WhatsApp", PHONE),
        _f("booking_email", "Booking email", EMAIL),
    ],
    "creator": [
        _f("creator_name", "Creator or channel name", TEXT, True),
        _f("categories", "Creator category", LIST, True, hint="Bible teaching, testimony, youth ministry, podcast…"),
        _f("topics", "Gospel topics", LIST, True, hint="Prayer, marriage, discipleship, worship, apologetics…"),
        _f("content_ownership", "Content ownership", SINGLE, True, ["Original", "Curated", "Both"]),
        # Fix 5: region field for creators
        _f("region", "Region", SINGLE, True, REGION_OPTIONS, hint="Where you are primarily based"),
        _f("social_links", "Social media links", URLS),
        # Fix 2: full_name is optional — account name already captured at sign-up
        _f("full_name", "Full name", TEXT, hint="Leave blank to use the name from your account"),
        _f("email", "Contact email", EMAIL, True),
        _f("phone", "Phone number", PHONE),
        _f("whatsapp", "WhatsApp number", PHONE),
    ],
}

TRACK_BY_ROLE = {"pastor": "ministry", "artiste": "artiste", "creator": "creator"}
ROLE_BY_TRACK = {v: k for k, v in TRACK_BY_ROLE.items()}

_PHONE_RE = re.compile(r"^\+?[0-9][0-9 ()-]{6,19}$")
_url_validator = URLValidator(schemes=["http", "https"])


def _text(value, limit=200):
    if not isinstance(value, str) or not value.strip() or len(value.strip()) > limit:
        raise ValueError(f"Enter text up to {limit} characters.")
    return value.strip()


def _url(value):
    value = _text(value, 500)
    try:
        _url_validator(value)
    except DjangoValidationError:
        raise ValueError("Enter a valid http(s) link.")
    return value


def _items(value, convert):
    if not isinstance(value, list) or not value or len(value) > MAX_ITEMS:
        raise ValueError(f"Provide 1 to {MAX_ITEMS} items.")
    return [convert(v) for v in value]


def _clean(field, value):
    kind = field["type"]
    if kind == TEXT:
        return _text(value)
    if kind == TEXTAREA:
        return _text(value, 1000)
    if kind == URL:
        return _url(value)
    if kind == EMAIL:
        text = _text(value, 254)
        try:
            validate_email(text)
        except DjangoValidationError:
            raise ValueError("Enter a valid email address.")
        return text.lower()
    if kind == PHONE:
        text = _text(value, 20)
        if not _PHONE_RE.match(text):
            raise ValueError("Enter a valid phone number, e.g. +256 700 000 000.")
        return text
    if kind == SINGLE:
        if value not in field["options"]:
            raise ValueError("Choose one of the listed options.")
        return value
    if kind == LIST:
        return _items(value, _text)
    if kind == URLS:
        return _items(value, _url)
    if kind == LOCATIONS:
        def location(item):
            if not isinstance(item, dict):
                raise ValueError("Each location needs a name, address and map link.")
            return {
                "name": _text(item.get("name")),
                "address": _text(item.get("address")),
                "map_url": _url(item.get("map_url")),
            }
        return _items(value, location)


def validate_answers(track, answers):
    """Return (cleaned, errors) for the given track's fields."""
    if not isinstance(answers, dict):
        return {}, {"answers": "Must be an object keyed by field key."}
    cleaned, errors = {}, {}
    for field in QUESTIONS[track]:
        key, value = field["key"], answers.get(field["key"])
        if value in (None, "", []):
            if field["required"]:
                errors[key] = "This field is required."
            continue
        try:
            cleaned[key] = _clean(field, value)
        except (ValueError, TypeError) as exc:
            errors[key] = str(exc)

    # Fix 1: booking email is required only when any other booking field is provided.
    if track == "artiste":
        booking_fields = ("booking_name", "booking_phone", "booking_whatsapp", "booking_email")
        has_any_booking = any(cleaned.get(k) for k in booking_fields)
        if has_any_booking and not cleaned.get("booking_email"):
            errors["booking_email"] = "Provide a booking email to go with the other booking details."

    return cleaned, errors
