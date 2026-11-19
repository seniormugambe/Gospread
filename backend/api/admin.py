from datetime import timedelta

from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import (
    AudioSpace, Church, ChurchEvent, CommunityComment, CommunityPost,
    Donation, FeedbackSubmission, GivingFund, LiveStream, LiveStreamChatMessage, LiveStreamViewer,
    PrayerComment, PrayerRequest, PaymentGatewayCheckout, SavedSermon, Scripture, Sermon,
    SermonShort, User, VerificationApplication, VerificationStatusHistory, WatchProgress, WorshipSlide, WorshipSong,
)


@admin.register(User)
class GospreadUserAdmin(UserAdmin):
    # Use email as the primary identifier throughout the admin
    ordering = ("email",)
    list_display = ("email", "username", "first_name", "last_name", "role", "is_staff", "is_active", "date_joined")
    list_filter = ("role", "is_staff", "is_active", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name")
    readonly_fields = ("date_joined", "last_login", "email_verified_at", "email_verification_sent_at")

    # Replace the default fieldsets so email appears at the top and is editable
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "avatar_url", "bio")}),
        ("Email verification", {"fields": ("email_verified_at", "email_verification_sent_at")}),
        ("Gospread", {"fields": ("role", "praise_xp", "streak_days", "last_checkin_date", "total_study_minutes")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fieldset shown when creating a new user via the admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "first_name", "last_name", "password1", "password2", "role", "is_staff", "is_active"),
        }),
    )


@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "location", "ministry_focus", "is_featured", "created_at")
    list_filter = ("is_featured", "denomination", "created_at")
    search_fields = ("name", "description", "location", "ministry_focus", "owner__email")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("followers",)


class VerificationStatusHistoryInline(admin.TabularInline):
    model = VerificationStatusHistory
    extra = 0
    can_delete = False
    fields = ("status", "reason", "changed_by", "created_at")
    readonly_fields = fields


@admin.register(VerificationApplication)
class VerificationApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "track", "status", "submitted_at", "reviewer", "reviewed_at")
    list_filter = ("status", "track", "submitted_at")
    search_fields = ("user__email", "user__username", "user__first_name", "user__last_name")
    readonly_fields = (
        "reviewer", "submitted_at", "updated_at", "reviewed_at",
        "privacy_notice_acknowledged_at", "evidence_expires_at", "evidence_purged_at",
        "appeal_reason", "appeal_evidence_urls", "appealed_at",
    )
    fields = (
        "user", "track", "status", "official_profile_url", "evidence_urls", "evidence_notes",
        "authorization_confirmed", "privacy_notice_acknowledged_at", "decision_reason",
        "reviewer_notes", "appeal_reason", "appeal_evidence_urls", "appealed_at", "reviewer",
        "submitted_at", "updated_at", "reviewed_at",
        "evidence_expires_at", "evidence_purged_at",
    )
    inlines = (VerificationStatusHistoryInline,)

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change:
            previous_status = VerificationApplication.objects.filter(pk=obj.pk).values_list("status", flat=True).first()
        if previous_status != obj.status:
            now = timezone.now()
            obj.reviewer = request.user
            obj.reviewed_at = now
            if obj.status in (
                VerificationApplication.Status.PENDING,
                VerificationApplication.Status.UNDER_REVIEW,
            ):
                obj.decision_reason = ""
                obj.evidence_expires_at = None
                if obj.status == VerificationApplication.Status.PENDING:
                    obj.reviewer = None
                    obj.reviewed_at = None
            elif obj.status in (
                VerificationApplication.Status.VERIFIED,
                VerificationApplication.Status.REJECTED,
                VerificationApplication.Status.SUSPENDED,
            ):
                obj.evidence_expires_at = now + timedelta(
                    days=settings.VERIFICATION_EVIDENCE_RETENTION_DAYS,
                )
                obj.evidence_purged_at = None
            else:
                obj.evidence_expires_at = None
        super().save_model(request, obj, form, change)
        if previous_status != obj.status:
            VerificationStatusHistory.objects.create(
                application=obj,
                status=obj.status,
                reason=obj.decision_reason,
                changed_by=request.user,
            )


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = (
        "title", "church", "speaker", "kind", "visibility", "is_published",
        "scheduled_for", "is_featured", "view_count", "published_at",
    )
    list_filter = ("kind", "visibility", "is_published", "is_featured", "category", "scheduled_for", "published_at")
    search_fields = ("title", "description", "speaker", "church__name")
    autocomplete_fields = ("church",)
    date_hierarchy = "created_at"


@admin.register(SermonShort)
class SermonShortAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "speaker", "duration_seconds", "is_published", "view_count", "like_count", "created_at")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "speaker", "caption", "church__name")
    autocomplete_fields = ("church", "sermon")


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "stream_type", "status", "viewer_count", "is_featured", "scheduled_for")
    list_filter = ("stream_type", "status", "auto_save_to_library", "is_featured", "scheduled_for")
    search_fields = ("title", "description", "church__name")
    autocomplete_fields = ("church",)
    date_hierarchy = "scheduled_for"


@admin.register(LiveStreamChatMessage)
class LiveStreamChatMessageAdmin(admin.ModelAdmin):
    list_display = ("stream", "author", "created_at", "is_host", "is_pinned")
    list_filter = ("is_host", "is_moderator", "is_pinned", "created_at")
    search_fields = ("message", "author__email", "stream__title")
    autocomplete_fields = ("stream", "author")


@admin.register(LiveStreamViewer)
class LiveStreamViewerAdmin(admin.ModelAdmin):
    list_display = ("stream", "user", "session_id", "is_active", "last_seen_at")
    list_filter = ("is_active", "last_seen_at")
    search_fields = ("session_id", "stream__title", "user__email")
    autocomplete_fields = ("stream", "user")


@admin.register(ChurchEvent)
class ChurchEventAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "event_type", "starts_at", "is_featured")
    list_filter = ("event_type", "is_featured", "starts_at")
    search_fields = ("title", "description", "church__name", "location")
    autocomplete_fields = ("church", "stream")
    date_hierarchy = "starts_at"


class PrayerCommentInline(admin.TabularInline):
    model = PrayerComment
    extra = 0
    autocomplete_fields = ("author",)


@admin.register(PrayerRequest)
class PrayerRequestAdmin(admin.ModelAdmin):
    list_display = ("short_body", "author", "church", "tag", "is_public", "is_anonymous", "created_at")
    list_filter = ("tag", "is_public", "is_anonymous", "created_at")
    search_fields = ("body", "author__email", "church__name")
    autocomplete_fields = ("author", "church")
    filter_horizontal = ("prayed_by",)
    inlines = (PrayerCommentInline,)

    @admin.display(description="Prayer")
    def short_body(self, obj):
        return str(obj)


@admin.register(GivingFund)
class GivingFundAdmin(admin.ModelAdmin):
    list_display = ("name", "church", "goal_amount", "is_active", "sort_order", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description", "church__name")
    autocomplete_fields = ("church",)


@admin.register(FeedbackSubmission)
class FeedbackSubmissionAdmin(admin.ModelAdmin):
    list_display = ("category", "short_message", "contact_email", "user", "created_at")
    list_filter = ("category", "created_at")
    search_fields = ("message", "contact_email", "user__email")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at",)

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message[:120]


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("amount", "currency", "fund", "church", "donor", "frequency", "status", "created_at")
    list_filter = ("status", "frequency", "currency", "is_anonymous", "created_at")
    search_fields = ("donor_name", "donor_email", "payment_reference", "fund__name", "church__name")
    autocomplete_fields = ("church", "fund", "donor")
    date_hierarchy = "created_at"


@admin.register(PaymentGatewayCheckout)
class PaymentGatewayCheckoutAdmin(admin.ModelAdmin):
    list_display = ("gateway_reference", "donation", "provider", "status", "created_at")
    list_filter = ("provider", "status", "created_at")
    search_fields = ("gateway_reference", "donation__donor_email", "donation__donor_name", "donation__fund__name")
    autocomplete_fields = ("donation",)
    readonly_fields = ("gateway_reference", "created_at", "updated_at")


class WorshipSlideInline(admin.TabularInline):
    model = WorshipSlide
    extra = 1


@admin.register(WorshipSong)
class WorshipSongAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "author", "key", "is_active", "updated_at")
    list_filter = ("is_active", "key", "updated_at")
    search_fields = ("title", "author", "church__name")
    autocomplete_fields = ("church",)
    inlines = (WorshipSlideInline,)


@admin.register(SavedSermon)
class SavedSermonAdmin(admin.ModelAdmin):
    list_display = ("user", "sermon", "created_at")
    search_fields = ("user__email", "sermon__title")
    autocomplete_fields = ("user", "sermon")


@admin.register(WatchProgress)
class WatchProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "sermon", "position_seconds", "completed", "updated_at")
    list_filter = ("completed", "updated_at")
    search_fields = ("user__email", "sermon__title")
    autocomplete_fields = ("user", "sermon")


@admin.register(Scripture)
class ScriptureAdmin(admin.ModelAdmin):
    list_display = ("reference", "translation", "is_active")
    list_filter = ("translation", "is_active")
    search_fields = ("reference", "text")


class CommunityCommentInline(admin.TabularInline):
    model = CommunityComment
    extra = 0
    autocomplete_fields = ("author",)


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "is_anonymous", "created_at")
    list_filter = ("category", "is_anonymous", "created_at")
    search_fields = ("title", "content", "author__email", "scripture_reference")
    autocomplete_fields = ("author", "church")
    inlines = (CommunityCommentInline,)


@admin.register(AudioSpace)
class AudioSpaceAdmin(admin.ModelAdmin):
    list_display = ("title", "host", "ministry_name", "is_live", "started_at", "ended_at")
    list_filter = ("is_live", "started_at")
    search_fields = ("title", "topic", "room_name", "host__email", "ministry_name")
    autocomplete_fields = ("host",)
