from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ChangePasswordView, ChurchEventViewSet, ChurchViewSet, DonationViewSet, GivingFundViewSet,
    GospreadTokenView, HealthCheckView, LiveStreamViewSet, LogoutView, MeView,
    PrayerRequestViewSet, RandomScriptureView, SavedSermonViewSet, SermonShortViewSet,
    SermonViewSet, SignupView, StreakCheckinView, WatchProgressViewSet, WorshipSongViewSet,
)

router = DefaultRouter()
router.register("churches", ChurchViewSet, basename="church")
router.register("sermons", SermonViewSet, basename="sermon")
router.register("shorts", SermonShortViewSet, basename="short")
router.register("streams", LiveStreamViewSet, basename="stream")
router.register("events", ChurchEventViewSet, basename="event")
router.register("prayers", PrayerRequestViewSet, basename="prayer")
router.register("giving-funds", GivingFundViewSet, basename="giving-fund")
router.register("donations", DonationViewSet, basename="donation")
router.register("worship-songs", WorshipSongViewSet, basename="worship-song")
router.register("saved", SavedSermonViewSet, basename="saved")
router.register("progress", WatchProgressViewSet, basename="progress")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),

    # Primary auth endpoints (canonical)
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path("auth/token/", GospreadTokenView.as_view(), name="token"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/streak/checkin/", StreakCheckinView.as_view(), name="streak-checkin"),

    # Alias endpoints to match frontend djangoApi.ts expectations
    path("auth/login/", GospreadTokenView.as_view(), name="login"),
    path("auth/register/", SignupView.as_view(), name="register"),

    path("scriptures/random/", RandomScriptureView.as_view(), name="random-scripture"),
    path("", include(router.urls)),
]
