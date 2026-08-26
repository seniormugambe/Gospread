from pathlib import Path
from uuid import uuid4

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Church, ChurchEvent, CommunityComment, CommunityPost, Donation, GivingFund, LiveStream, PrayerComment, PrayerRequest,
    PaymentGatewayCheckout, SavedSermon, Scripture, Sermon, SermonShort, User,
    WatchProgress, WorshipSlide, WorshipSong,
)


class UserSerializer(serializers.ModelSerializer):
    church_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name", "avatar_url",
            "bio", "role", "praise_xp", "streak_days", "last_checkin_date",
            "total_study_minutes", "church_name",
        )
        read_only_fields = ("id", "email", "praise_xp", "streak_days", "last_checkin_date", "total_study_minutes")

    def get_church_name(self, user):
        church = user.owned_churches.order_by("created_at").first()
        return church.name if church else None


class GospreadTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs[self.username_field] = attrs[self.username_field].strip().lower()
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value, self.context["request"].user)
        return value


class ScriptureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scripture
        fields = ("id", "reference", "text", "translation")


class SignupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    church_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BELIEVER, required=False)

    class Meta:
        model = User
        fields = ("id", "email", "password", "name", "church_name", "role")
        read_only_fields = ("id",)

    def validate(self, attrs):
        attrs["email"] = attrs["email"].strip().lower()
        return attrs

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    @transaction.atomic
    def create(self, validated_data):
        name = validated_data.pop("name").strip()
        church_name = validated_data.pop("church_name", "").strip()
        password = validated_data.pop("password")
        role = validated_data.pop("role", User.Role.BELIEVER)
        parts = name.split(maxsplit=1)
        email = validated_data["email"].lower()
        username_base = slugify(email.split("@", 1)[0]) or "member"
        username = username_base
        suffix = 1
        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f"{username_base}-{suffix}"
        user = User(
            username=username,
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else "",
            role=role,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        # If a church name was provided during signup, create the church and attach the user as owner.
        if church_name:
            base_slug = slugify(church_name) or "church"
            slug = base_slug
            suffix = 1
            while Church.objects.filter(slug=slug).exists():
                suffix += 1
                slug = f"{base_slug}-{suffix}"
            Church.objects.create(name=church_name, slug=slug, owner=user)
        return user


class ChurchSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    follower_count = serializers.IntegerField(source="followers.count", read_only=True)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    sermon_count = serializers.IntegerField(source="sermons.count", read_only=True)
    head_pastor = serializers.SerializerMethodField()
    top_stars = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Church
        fields = (
            "id", "name", "slug", "description", "location", "logo_url", "cover_image_url",
            "denomination", "ministry_focus", "phone", "email", "website", "is_featured",
            "owner", "owner_name", "follower_count", "sermon_count", "head_pastor",
            "top_stars", "media", "schedule", "created_at",
        )
        read_only_fields = ("id", "owner", "created_at")

    def create(self, validated_data):
        slug_value = validated_data.get("slug")
        if not slug_value:
            base_slug = slugify(validated_data.get("name", "church")) or "church"
            slug_value = base_slug
            suffix = 1
            while Church.objects.filter(slug=slug_value).exists():
                suffix += 1
                slug_value = f"{base_slug}-{suffix}"
            validated_data["slug"] = slug_value
        return super().create(validated_data)

    def get_head_pastor(self, church):
        owner = church.owner
        return {
            "id": owner.id,
            "name": owner.get_full_name() or owner.username,
            "title": "Head Pastor",
            "avatar_url": owner.avatar_url,
        }

    def get_top_stars(self, church):
        stars = [self.get_head_pastor(church)]
        seen = {stars[0]["name"].lower()}
        sermons = church.sermons.filter(is_published=True).order_by("-is_featured", "-view_count", "-published_at", "-created_at")[:8]
        shorts = church.shorts.filter(is_published=True).order_by("-like_count", "-view_count", "-created_at")[:8]

        for person_name in [item.speaker for item in sermons] + [item.speaker for item in shorts]:
            name = person_name.strip()
            key = name.lower()
            if not name or key in seen:
                continue
            stars.append({"id": None, "name": name, "title": "Featured voice", "avatar_url": ""})
            seen.add(key)
            if len(stars) == 6:
                break
        return stars

    def get_media(self, church):
        sermons = church.sermons.filter(is_published=True).order_by("-is_featured", "-published_at", "-created_at")[:4]
        shorts = church.shorts.filter(is_published=True).order_by("-created_at")[:4]
        streams = church.streams.exclude(recording_url="").order_by("-ended_at", "-scheduled_for")[:2]
        media = []

        for sermon in sermons:
            media.append({
                "id": sermon.id,
                "type": sermon.kind,
                "title": sermon.title,
                "speaker": sermon.speaker,
                "description": sermon.description,
                "thumbnail_url": sermon.thumbnail_url,
                "media_url": sermon.media_url,
                "published_at": sermon.published_at,
                "view_count": sermon.view_count,
            })
        for short in shorts:
            media.append({
                "id": short.id,
                "type": "short",
                "title": short.title,
                "speaker": short.speaker,
                "description": short.caption,
                "thumbnail_url": short.thumbnail_url,
                "media_url": short.video_url,
                "published_at": short.created_at,
                "view_count": short.view_count,
            })
        for stream in streams:
            media.append({
                "id": stream.id,
                "type": "replay",
                "title": stream.title,
                "speaker": "",
                "description": stream.description,
                "thumbnail_url": stream.thumbnail_url,
                "media_url": stream.recording_url,
                "published_at": stream.ended_at or stream.scheduled_for,
                "view_count": stream.viewer_count,
            })
        return sorted(media, key=lambda item: item["published_at"] or church.created_at, reverse=True)[:8]

    def get_schedule(self, church):
        events = church.events.select_related("stream").filter(starts_at__gte=timezone.now()).order_by("starts_at")[:8]
        return [{
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "event_type": event.event_type,
            "starts_at": event.starts_at,
            "ends_at": event.ends_at,
            "location": event.location,
            "is_featured": event.is_featured,
            "stream_status": event.stream.status if event.stream else "",
        } for event in events]


class SermonSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    is_saved = serializers.SerializerMethodField()
    media_file = serializers.FileField(write_only=True, required=False, allow_empty_file=False)
    thumbnail_file = serializers.FileField(write_only=True, required=False, allow_empty_file=False)

    class Meta:
        model = Sermon
        fields = (
            "id", "church", "church_name", "speaker", "title", "description", "category",
            "kind", "media_url", "thumbnail_url", "duration_seconds", "view_count",
            "is_featured", "published_at", "is_published", "created_at", "is_saved",
            "media_file", "thumbnail_file",
        )
        read_only_fields = ("id", "created_at", "church_name", "is_saved", "view_count")

    def _store_upload(self, uploaded_file, prefix):
        if not uploaded_file:
            return None
        extension = Path(uploaded_file.name).suffix or ""
        saved_name = default_storage.save(f"uploads/{prefix}/{uuid4().hex}{extension}", ContentFile(uploaded_file.read()))
        url = default_storage.url(saved_name)
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def create(self, validated_data):
        media_file = validated_data.pop("media_file", None)
        thumbnail_file = validated_data.pop("thumbnail_file", None)
        if media_file:
            validated_data["media_url"] = self._store_upload(media_file, "sermons")
        if thumbnail_file:
            validated_data["thumbnail_url"] = self._store_upload(thumbnail_file, "thumbnails")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        media_file = validated_data.pop("media_file", None)
        thumbnail_file = validated_data.pop("thumbnail_file", None)
        if media_file:
            validated_data["media_url"] = self._store_upload(media_file, "sermons")
        if thumbnail_file:
            validated_data["thumbnail_url"] = self._store_upload(thumbnail_file, "thumbnails")
        return super().update(instance, validated_data)

    def get_is_saved(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.saved_by.filter(user=user).exists()


class SermonShortSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    video_file = serializers.FileField(write_only=True, required=False, allow_empty_file=False)
    thumbnail_file = serializers.FileField(write_only=True, required=False, allow_empty_file=False)

    class Meta:
        model = SermonShort
        fields = (
            "id", "church", "church_name", "sermon", "title", "speaker", "caption",
            "video_url", "thumbnail_url", "duration_seconds", "like_count", "comment_count",
            "view_count", "is_published", "created_at", "video_file", "thumbnail_file",
        )
        read_only_fields = ("id", "created_at", "church_name", "like_count", "comment_count", "view_count")

    def _store_upload(self, uploaded_file, prefix):
        if not uploaded_file:
            return None
        extension = Path(uploaded_file.name).suffix or ""
        saved_name = default_storage.save(f"uploads/{prefix}/{uuid4().hex}{extension}", ContentFile(uploaded_file.read()))
        url = default_storage.url(saved_name)
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def create(self, validated_data):
        video_file = validated_data.pop("video_file", None)
        thumbnail_file = validated_data.pop("thumbnail_file", None)
        if video_file:
            validated_data["video_url"] = self._store_upload(video_file, "shorts")
        if thumbnail_file:
            validated_data["thumbnail_url"] = self._store_upload(thumbnail_file, "thumbnails")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        video_file = validated_data.pop("video_file", None)
        thumbnail_file = validated_data.pop("thumbnail_file", None)
        if video_file:
            validated_data["video_url"] = self._store_upload(video_file, "shorts")
        if thumbnail_file:
            validated_data["thumbnail_url"] = self._store_upload(thumbnail_file, "thumbnails")
        return super().update(instance, validated_data)

    def validate_duration_seconds(self, value):
        if value > 180:
            raise serializers.ValidationError("Sermon shorts must be three minutes or less.")
        return value


class LiveStreamSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)

    class Meta:
        model = LiveStream
        fields = "__all__"
        read_only_fields = ("id", "viewer_count", "created_at")


class ChurchEventSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)

    class Meta:
        model = ChurchEvent
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class PrayerCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = PrayerComment
        fields = ("id", "prayer", "author_name", "body", "created_at")
        read_only_fields = ("id", "prayer", "author_name", "created_at")

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


class PrayerRequestSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    prayed_count = serializers.IntegerField(source="prayed_by.count", read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)
    comments = PrayerCommentSerializer(many=True, read_only=True)
    has_prayed = serializers.SerializerMethodField()

    class Meta:
        model = PrayerRequest
        fields = (
            "id", "author_name", "church", "body", "tag", "is_anonymous", "is_public",
            "prayed_count", "comment_count", "comments", "has_prayed", "created_at",
        )
        read_only_fields = ("id", "author_name", "prayed_count", "comment_count", "comments", "has_prayed", "created_at")

    def get_author_name(self, obj):
        return "Anonymous" if obj.is_anonymous else (obj.author.get_full_name() or obj.author.username)

    def get_has_prayed(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.prayed_by.filter(id=user.id).exists()


class CommunityCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_handle = serializers.CharField(source="author.username", read_only=True)
    author_avatar = serializers.CharField(source="author.avatar_url", read_only=True)
    author_role = serializers.CharField(source="author.get_role_display", read_only=True)
    amens_count = serializers.IntegerField(source="amen_by.count", read_only=True)
    has_amened = serializers.SerializerMethodField()

    class Meta:
        model = CommunityComment
        fields = ("id", "author_name", "author_handle", "author_avatar", "author_role", "content", "created_at", "amens_count", "has_amened")
        read_only_fields = ("id", "author_name", "author_handle", "author_avatar", "author_role", "created_at", "amens_count", "has_amened")

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_has_amened(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.amen_by.filter(id=user.id).exists()


class CommunityPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_handle = serializers.CharField(source="author.username", read_only=True)
    author_avatar = serializers.CharField(source="author.avatar_url", read_only=True)
    author_role = serializers.CharField(source="author.get_role_display", read_only=True)
    author_church = serializers.SerializerMethodField()
    amens_count = serializers.IntegerField(source="amen_by.count", read_only=True)
    prayers_count = serializers.IntegerField(source="prayed_by.count", read_only=True)
    glory_count = serializers.IntegerField(source="glory_by.count", read_only=True)
    comments = CommunityCommentSerializer(many=True, read_only=True)
    shares_count = serializers.IntegerField(read_only=True, default=0)
    has_amened = serializers.SerializerMethodField()
    has_prayed = serializers.SerializerMethodField()
    has_glory = serializers.SerializerMethodField()
    has_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = ("id", "author_name", "author_handle", "author_avatar", "author_role", "author_church", "category", "title", "content", "scripture_reference", "scripture_text", "image_url", "audio_url", "audio_snippet_title", "audio_snippet_duration", "created_at", "amens_count", "prayers_count", "glory_count", "shares_count", "comments", "is_anonymous", "has_amened", "has_prayed", "has_glory", "has_bookmarked", "tags")
        read_only_fields = ("id", "author_name", "author_handle", "author_avatar", "author_role", "author_church", "created_at", "amens_count", "prayers_count", "glory_count", "shares_count", "comments", "has_amened", "has_prayed", "has_glory", "has_bookmarked")

    def get_author_name(self, obj):
        return "Kingdom Intercessor" if obj.is_anonymous else (obj.author.get_full_name() or obj.author.username)

    def get_author_church(self, obj):
        return obj.church.name if obj.church else "Global Fellowship"

    def _has(self, relation, obj):
        user = self.context["request"].user
        return user.is_authenticated and getattr(obj, relation).filter(id=user.id).exists()

    def get_has_amened(self, obj): return self._has("amen_by", obj)
    def get_has_prayed(self, obj): return self._has("prayed_by", obj)
    def get_has_glory(self, obj): return self._has("glory_by", obj)
    def get_has_bookmarked(self, obj): return self._has("bookmarked_by", obj)


class SavedSermonSerializer(serializers.ModelSerializer):
    sermon_detail = SermonSerializer(source="sermon", read_only=True)

    class Meta:
        model = SavedSermon
        fields = ("id", "sermon", "sermon_detail", "created_at")
        read_only_fields = ("id", "created_at")


class WatchProgressSerializer(serializers.ModelSerializer):
    sermon_detail = SermonSerializer(source="sermon", read_only=True)

    class Meta:
        model = WatchProgress
        fields = ("id", "sermon", "sermon_detail", "position_seconds", "completed", "updated_at")
        read_only_fields = ("id", "updated_at")


class GivingFundSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    raised_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    donor_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = GivingFund
        fields = (
            "id", "church", "church_name", "name", "description", "goal_amount",
            "raised_amount", "donor_count", "is_active", "sort_order", "created_at",
        )
        read_only_fields = ("id", "created_at")


class DonationSerializer(serializers.ModelSerializer):
    fund_name = serializers.CharField(source="fund.name", read_only=True)
    church_name = serializers.CharField(source="church.name", read_only=True)
    checkout_reference = serializers.UUIDField(source="checkout.gateway_reference", read_only=True)
    checkout_url = serializers.URLField(source="checkout.checkout_url", read_only=True)

    class Meta:
        model = Donation
        fields = (
            "id", "church", "church_name", "fund", "fund_name", "donor", "donor_name",
            "donor_email", "amount", "currency", "frequency", "status", "payment_reference",
            "checkout_reference", "checkout_url", "is_anonymous", "created_at",
        )
        read_only_fields = ("id", "donor", "status", "payment_reference", "created_at")

    def validate(self, attrs):
        fund = attrs.get("fund")
        church = attrs.get("church")
        if fund and church and fund.church_id != church.id:
            raise serializers.ValidationError("The selected fund must belong to the selected church.")
        return attrs


class PaymentGatewayCheckoutSerializer(serializers.ModelSerializer):
    donation = DonationSerializer(read_only=True)

    class Meta:
        model = PaymentGatewayCheckout
        fields = (
            "id", "donation", "provider", "gateway_reference", "checkout_url",
            "status", "metadata", "created_at", "updated_at",
        )
        read_only_fields = fields


class DonationCheckoutSerializer(serializers.Serializer):
    church = serializers.PrimaryKeyRelatedField(queryset=Church.objects.all(), required=False)
    fund = serializers.PrimaryKeyRelatedField(queryset=GivingFund.objects.filter(is_active=True), required=False)
    fund_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    donor_name = serializers.CharField(max_length=160, required=False, allow_blank=True)
    donor_email = serializers.EmailField(required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    currency = serializers.CharField(max_length=3, default="USD")
    frequency = serializers.ChoiceField(choices=Donation.Frequency.choices, default=Donation.Frequency.ONE_TIME)
    provider = serializers.ChoiceField(choices=PaymentGatewayCheckout.Provider.choices, default=PaymentGatewayCheckout.Provider.SANDBOX)
    is_anonymous = serializers.BooleanField(default=False)
    return_url = serializers.URLField(required=False, allow_blank=True)

    def validate_currency(self, value):
        return value.upper()

    def validate(self, attrs):
        fund = attrs.get("fund")
        church = attrs.get("church")
        if fund and church and fund.church_id != church.id:
            raise serializers.ValidationError("The selected fund must belong to the selected church.")
        if fund and not church:
            attrs["church"] = fund.church
        if not attrs.get("fund") and not attrs.get("fund_name", "").strip():
            raise serializers.ValidationError({"fund_name": "Choose or enter a giving fund."})
        return attrs


class StreakCheckinSerializer(serializers.Serializer):
    """Read-only response shape for the daily streak check-in endpoint."""
    success = serializers.BooleanField(read_only=True)
    streak_days = serializers.IntegerField(read_only=True)
    praise_xp_earned = serializers.IntegerField(read_only=True)
    total_praise_xp = serializers.IntegerField(read_only=True)
    already_checked_in = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)


class WorshipSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorshipSlide
        fields = ("id", "order", "text")
        read_only_fields = ("id",)


class WorshipSongSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    slides = WorshipSlideSerializer(many=True)

    class Meta:
        model = WorshipSong
        fields = (
            "id", "church", "church_name", "title", "author", "key", "copyright_info",
            "is_active", "slides", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        slides_data = validated_data.pop("slides", [])
        song = WorshipSong.objects.create(**validated_data)
        for index, slide_data in enumerate(slides_data, start=1):
            WorshipSlide.objects.create(song=song, order=slide_data.get("order") or index, text=slide_data["text"])
        return song

    def update(self, instance, validated_data):
        slides_data = validated_data.pop("slides", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if slides_data is not None:
            instance.slides.all().delete()
            for index, slide_data in enumerate(slides_data, start=1):
                WorshipSlide.objects.create(song=instance, order=slide_data.get("order") or index, text=slide_data["text"])
        return instance
