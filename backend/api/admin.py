from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Church, ChurchEvent, Donation, GivingFund, LiveStream, PrayerComment, PrayerRequest,
    PaymentGatewayCheckout, SavedSermon, Scripture, Sermon, SermonShort, User,
    WatchProgress, WorshipSlide, WorshipSong,
)

@admin.register(User)
class GospreadUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Gospread", {"fields": ("avatar_url",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Gospread", {"fields": ("email",)}),)
    list_display = ("email", "username", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")


@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "location", "ministry_focus", "is_featured", "created_at")
    list_filter = ("is_featured", "denomination", "created_at")
    search_fields = ("name", "description", "location", "ministry_focus", "owner__email")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("followers",)


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "speaker", "kind", "is_published", "is_featured", "view_count", "published_at")
    list_filter = ("kind", "is_published", "is_featured", "category", "published_at")
    search_fields = ("title", "description", "speaker", "church__name")
    autocomplete_fields = ("church",)
    date_hierarchy = "published_at"


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
