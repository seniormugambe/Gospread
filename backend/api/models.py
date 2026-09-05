import uuid

from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BELIEVER = "believer", "Global Believer"
        CREATOR = "creator", "Gospel Creator"
        PASTOR = "pastor", "Pastor / Church Leader"
        ARTISTE = "artiste", "Gospel Artiste / Psalmist"

    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.BELIEVER)
    praise_xp = models.PositiveIntegerField(default=100)
    streak_days = models.PositiveIntegerField(default=0)
    last_checkin_date = models.DateField(null=True, blank=True)
    total_study_minutes = models.PositiveIntegerField(default=0)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class Scripture(models.Model):
    reference = models.CharField(max_length=80, unique=True)
    text = models.TextField()
    translation = models.CharField(max_length=20, default="KJV")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["reference"]

    def __str__(self):
        return f"{self.reference} ({self.translation})"


class Church(models.Model):
    name = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=180, blank=True)
    logo_url = models.URLField(blank=True)
    cover_image_url = models.URLField(blank=True)
    denomination = models.CharField(max_length=120, blank=True)
    ministry_focus = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_churches")
    followers = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="followed_churches")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Sermon(models.Model):
    class Kind(models.TextChoices):
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"
        ARTICLE = "article", "Article"

    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="sermons")
    speaker = models.CharField(max_length=150)
    title = models.CharField(max_length=220)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.VIDEO)
    media_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class SermonShort(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="shorts")
    sermon = models.ForeignKey(Sermon, on_delete=models.SET_NULL, related_name="shorts", null=True, blank=True)
    title = models.CharField(max_length=140)
    speaker = models.CharField(max_length=120)
    caption = models.CharField(max_length=280, blank=True)
    video_url = models.URLField(blank=True)
    thumbnail_url = models.URLField()
    duration_seconds = models.PositiveSmallIntegerField(default=60)
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class LiveStream(models.Model):
    class StreamType(models.TextChoices):
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        LIVE = "live", "Live"
        ENDED = "ended", "Ended"

    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="streams")
    title = models.CharField(max_length=220)
    description = models.TextField(blank=True)
    stream_type = models.CharField(max_length=10, choices=StreamType.choices, default=StreamType.VIDEO)
    playback_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    recording_url = models.URLField(blank=True)
    auto_save_to_library = models.BooleanField(default=True)
    quality_label = models.CharField(max_length=40, blank=True)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.SCHEDULED)
    scheduled_for = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    viewer_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-status", "scheduled_for"]

    def __str__(self):
        return self.title


class ChurchEvent(models.Model):
    class EventType(models.TextChoices):
        SERVICE = "service", "Service"
        BIBLE_STUDY = "bible_study", "Bible study"
        PRAYER = "prayer", "Prayer"
        WORSHIP = "worship", "Worship"
        OUTREACH = "outreach", "Outreach"
        OTHER = "other", "Other"

    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.SERVICE)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=180, blank=True)
    stream = models.ForeignKey(LiveStream, on_delete=models.SET_NULL, related_name="events", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["starts_at"]

    def __str__(self):
        return self.title


class PrayerRequest(models.Model):
    class Tag(models.TextChoices):
        HEALING = "healing", "Healing"
        GUIDANCE = "guidance", "Guidance"
        FAMILY = "family", "Family"
        FINANCES = "finances", "Finances"
        PRAISE = "praise", "Praise"
        OTHER = "other", "Other"

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prayer_requests")
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="prayer_requests", null=True, blank=True)
    body = models.TextField(max_length=2000)
    tag = models.CharField(max_length=20, choices=Tag.choices, default=Tag.OTHER)
    is_anonymous = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    prayed_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="prayed_requests")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.body[:80]


class PrayerComment(models.Model):
    prayer = models.ForeignKey(PrayerRequest, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prayer_comments")
    body = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.body[:80]


class CommunityPost(models.Model):
    class Category(models.TextChoices):
        TESTIMONY = "testimony", "Testimony"
        PRAYER = "prayer", "Prayer"
        REFLECTION = "reflection", "Reflection"
        DISCUSSION = "discussion", "Discussion"

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="community_posts")
    church = models.ForeignKey(Church, on_delete=models.SET_NULL, related_name="community_posts", null=True, blank=True)
    category = models.CharField(max_length=12, choices=Category.choices)
    title = models.CharField(max_length=220, blank=True)
    content = models.TextField(max_length=5000)
    scripture_reference = models.CharField(max_length=120, blank=True)
    scripture_text = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    audio_url = models.URLField(blank=True)
    audio_snippet_title = models.CharField(max_length=180, blank=True)
    audio_snippet_duration = models.CharField(max_length=20, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_anonymous = models.BooleanField(default=False)
    amen_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="amened_community_posts")
    prayed_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="prayed_community_posts")
    glory_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="gloried_community_posts")
    bookmarked_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="bookmarked_community_posts")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title or self.content[:80]


class CommunityComment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="community_comments")
    content = models.TextField(max_length=1000)
    amen_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="amened_community_comments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class GivingFund(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="giving_funds")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "name"]
        constraints = [models.UniqueConstraint(fields=["church", "name"], name="unique_giving_fund_name_per_church")]

    def __str__(self):
        return f"{self.church}: {self.name}"


class Donation(models.Model):
    class Frequency(models.TextChoices):
        ONE_TIME = "one_time", "One time"
        MONTHLY = "monthly", "Monthly"

    class Status(models.TextChoices):
        PLEDGED = "pledged", "Pledged"
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="donations")
    fund = models.ForeignKey(GivingFund, on_delete=models.PROTECT, related_name="donations")
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="donations", null=True, blank=True)
    donor_name = models.CharField(max_length=160, blank=True)
    donor_email = models.EmailField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    frequency = models.CharField(max_length=12, choices=Frequency.choices, default=Frequency.ONE_TIME)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PLEDGED)
    payment_reference = models.CharField(max_length=120, blank=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.amount} {self.currency} to {self.fund}"


class PaymentGatewayCheckout(models.Model):
    class Provider(models.TextChoices):
        SANDBOX = "sandbox", "Sandbox"
        STRIPE = "stripe", "Stripe"
        PAYPAL = "paypal", "PayPal"
        MPESA = "mpesa", "M-Pesa"

    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"
        FAILED = "failed", "Failed"

    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name="checkout")
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.SANDBOX)
    gateway_reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    checkout_url = models.URLField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.CREATED)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider} checkout {self.gateway_reference}"


class WorshipSong(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="worship_songs")
    title = models.CharField(max_length=180)
    author = models.CharField(max_length=160, blank=True)
    key = models.CharField(max_length=12, blank=True)
    copyright_info = models.CharField(max_length=240, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class WorshipSlide(models.Model):
    song = models.ForeignKey(WorshipSong, on_delete=models.CASCADE, related_name="slides")
    order = models.PositiveSmallIntegerField(default=1)
    text = models.TextField()

    class Meta:
        ordering = ["order", "id"]
        constraints = [models.UniqueConstraint(fields=["song", "order"], name="unique_worship_slide_order_per_song")]

    def __str__(self):
        return f"{self.song} slide {self.order}"


class AudioSpace(models.Model):
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="audio_spaces")
    room_name = models.CharField(max_length=180, unique=True)
    title = models.CharField(max_length=220)
    topic = models.CharField(max_length=280, blank=True)
    ministry_name = models.CharField(max_length=180, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_live = models.BooleanField(default=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return self.title


class SavedSermon(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_sermons")
    sermon = models.ForeignKey(Sermon, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "sermon"], name="unique_saved_sermon")]


class WatchProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_progress")
    sermon = models.ForeignKey(Sermon, on_delete=models.CASCADE, related_name="watch_progress")
    position_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [models.UniqueConstraint(fields=["user", "sermon"], name="unique_watch_progress")]
