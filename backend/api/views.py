from django.db import transaction
from django.db.models import Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.conf import settings
from django.utils import timezone
from django.utils.dateformat import format as date_format
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from livekit import api as livekit_api
from .models import Church, ChurchEvent, CommunityComment, CommunityPost, Donation, GivingFund, LiveStream, PaymentGatewayCheckout, PrayerComment, PrayerRequest, Scripture, SavedSermon, Sermon, SermonShort, WatchProgress, WorshipSong
from .permissions import IsPastorOwnerOrReadOnly
from .serializers import (
    ChurchEventSerializer, ChurchSerializer, CommunityCommentSerializer, CommunityPostSerializer, DonationCheckoutSerializer, DonationSerializer,
    GivingFundSerializer, LiveStreamSerializer, PaymentGatewayCheckoutSerializer,
    PrayerCommentSerializer, PrayerRequestSerializer, SavedSermonSerializer, ChangePasswordSerializer,
    GospreadTokenSerializer, ScriptureSerializer, SermonSerializer, SermonShortSerializer,
    SignupSerializer, UserSerializer, WatchProgressSerializer, WorshipSongSerializer,
)


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class GospreadTokenView(TokenObtainPairView):
    serializer_class = GospreadTokenSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"refresh": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            return Response({"refresh": ["Invalid or expired refresh token."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class StreakCheckinView(generics.GenericAPIView):
    """
    POST /auth/streak/checkin/
    Awards +50 Praise XP for the first check-in of the day.
    Returns streak_days, praise_xp_earned, and total_praise_xp.
    Idempotent — calling twice on the same day returns already_checked_in=True.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import datetime
        user = request.user
        today = timezone.localdate()
        already_checked_in = user.last_checkin_date == today

        if already_checked_in:
            return Response({
                "success": True,
                "streak_days": user.streak_days,
                "praise_xp_earned": 0,
                "total_praise_xp": user.praise_xp,
                "already_checked_in": True,
                "message": "You already checked in today. Come back tomorrow for your next streak!",
            })

        # Determine if streak continues or resets
        yesterday = today - datetime.timedelta(days=1)
        if user.last_checkin_date == yesterday:
            # Streak continues
            user.streak_days += 1
        else:
            # Streak broken or first ever check-in
            user.streak_days = 1

        xp_earned = 50
        user.praise_xp += xp_earned
        user.last_checkin_date = today
        user.save(update_fields=["streak_days", "praise_xp", "last_checkin_date"])

        return Response({
            "success": True,
            "streak_days": user.streak_days,
            "praise_xp_earned": xp_earned,
            "total_praise_xp": user.praise_xp,
            "already_checked_in": False,
            "message": f"Grace streak day {user.streak_days}! +{xp_earned} Praise XP awarded. 🔥",
        })


class RandomScriptureView(generics.RetrieveAPIView):
    serializer_class = ScriptureSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        scriptures = Scripture.objects.filter(is_active=True)
        previous_reference = self.request.query_params.get("exclude", "").strip()
        if previous_reference and scriptures.count() > 1:
            scriptures = scriptures.exclude(reference=previous_reference)
        scripture = scriptures.order_by("?").first()
        if scripture is None:
            from rest_framework.exceptions import NotFound
            raise NotFound("No active scriptures are available.")
        return scripture


class HealthCheckView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "message": "Django backend is healthy",
                "version": "Django DRF",
                "timestamp": timezone.now(),
            }
        )


class AudioSpaceTokenView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        room_name = str(request.data.get("room_name", "")).strip()
        can_publish = bool(request.data.get("can_publish", False))
        if not room_name:
            return Response({"room_name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        livekit_url = getattr(settings, "LIVEKIT_URL", "")
        api_key = getattr(settings, "LIVEKIT_API_KEY", "")
        api_secret = getattr(settings, "LIVEKIT_API_SECRET", "")
        if not livekit_url or not api_key or not api_secret:
            return Response({"detail": "LiveKit is not configured on the backend."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        identity = f"user-{request.user.id}"
        token = livekit_api.AccessToken(api_key, api_secret).with_identity(identity).with_name(
            request.user.get_full_name() or request.user.username
        ).with_grants(livekit_api.VideoGrants(room_join=True, room=room_name, can_publish=can_publish, can_subscribe=True))
        return Response({"server_url": livekit_url, "participant_token": token.to_jwt(), "room_name": room_name})


class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.select_related("owner").prefetch_related("followers")
    serializer_class = ChurchSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("name", "description", "location", "denomination", "ministry_focus", "owner__first_name", "owner__last_name")
    ordering_fields = ("name", "created_at", "is_featured")
    lookup_field = "slug"

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, slug=None):
        church = self.get_object()
        if church.followers.filter(id=request.user.id).exists():
            church.followers.remove(request.user)
            return Response({"following": False})
        church.followers.add(request.user)
        return Response({"following": True})


class SermonViewSet(viewsets.ModelViewSet):
    serializer_class = SermonSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("title", "description", "speaker", "category", "church__name")
    ordering_fields = ("published_at", "created_at", "title", "view_count")

    def get_queryset(self):
        queryset = Sermon.objects.select_related("church").prefetch_related("saved_by")
        category = self.request.query_params.get("category")
        if category and category.lower() != "all":
            queryset = queryset.filter(category__iexact=category)
        if self.request.user.is_authenticated:
            return queryset.filter(Q(is_published=True) | Q(church__owner=self.request.user)).distinct()
        return queryset.filter(is_published=True)

    def perform_create(self, serializer):
        church = serializer.validated_data.get("church") or self.request.user.owned_churches.order_by("created_at").first()
        if church is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"church": "Create a church profile before uploading media."})
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only publish sermons for your own church.")
        serializer.save(church=church)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        sermon = self.get_object()
        saved, created = SavedSermon.objects.get_or_create(user=request.user, sermon=sermon)
        if not created:
            saved.delete()
        return Response({"saved": created})


class SermonShortViewSet(viewsets.ModelViewSet):
    serializer_class = SermonShortSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("title", "speaker", "caption", "church__name")
    ordering_fields = ("created_at", "duration_seconds", "view_count", "like_count")

    def get_queryset(self):
        queryset = SermonShort.objects.select_related("church", "sermon")
        if self.request.user.is_authenticated:
            return queryset.filter(Q(is_published=True) | Q(church__owner=self.request.user)).distinct()
        return queryset.filter(is_published=True)

    def perform_create(self, serializer):
        church = serializer.validated_data["church"]
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only publish shorts for your own church.")
        sermon = serializer.validated_data.get("sermon")
        if sermon and sermon.church_id != church.id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("The linked sermon must belong to the same church.")
        serializer.save()


class LiveStreamViewSet(viewsets.ModelViewSet):
    queryset = LiveStream.objects.select_related("church")
    serializer_class = LiveStreamSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("title", "description", "church__name")
    ordering_fields = ("scheduled_for", "viewer_count", "is_featured")

    def get_queryset(self):
        queryset = super().get_queryset()
        stream_status = self.request.query_params.get("status")
        stream_type = self.request.query_params.get("type")
        if stream_status:
            queryset = queryset.filter(status=stream_status)
        if stream_type:
            queryset = queryset.filter(stream_type=stream_type)
        return queryset

    def perform_create(self, serializer):
        church = serializer.validated_data["church"]
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create streams for your own church.")
        serializer.save()


class ChurchEventViewSet(viewsets.ModelViewSet):
    serializer_class = ChurchEventSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("title", "description", "church__name", "location")
    ordering_fields = ("starts_at", "created_at", "is_featured")

    def get_queryset(self):
        queryset = ChurchEvent.objects.select_related("church", "stream")
        if self.request.query_params.get("upcoming") in ("1", "true", "True"):
            queryset = queryset.filter(starts_at__gte=timezone.now())
        return queryset

    def perform_create(self, serializer):
        church = serializer.validated_data["church"]
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create events for your own church.")
        stream = serializer.validated_data.get("stream")
        if stream and stream.church_id != church.id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("The linked stream must belong to the same church.")
        serializer.save()


class PrayerRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PrayerRequestSerializer
    search_fields = ("body", "church__name")
    ordering_fields = ("created_at",)

    def get_queryset(self):
        queryset = PrayerRequest.objects.select_related("author", "church").prefetch_related("prayed_by", "comments", "comments__author")
        if self.request.user.is_authenticated:
            return queryset.filter(Q(is_public=True) | Q(author=self.request.user)).distinct()
        return queryset.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def pray(self, request, pk=None):
        prayer = self.get_object()
        if prayer.prayed_by.filter(id=request.user.id).exists():
            prayer.prayed_by.remove(request.user)
            return Response({"prayed": False, "prayed_count": prayer.prayed_by.count()})
        prayer.prayed_by.add(request.user)
        return Response({"prayed": True, "prayed_count": prayer.prayed_by.count()})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def comment(self, request, pk=None):
        prayer = self.get_object()
        serializer = PrayerCommentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        comment = PrayerComment.objects.create(prayer=prayer, author=request.user, **serializer.validated_data)
        return Response(PrayerCommentSerializer(comment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class CommunityPostViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityPostSerializer
    search_fields = ("title", "content", "scripture_reference", "tags", "church__name", "author__username")
    ordering_fields = ("created_at",)

    def get_queryset(self):
        queryset = CommunityPost.objects.select_related("author", "church").prefetch_related(
            "amen_by", "prayed_by", "glory_by", "bookmarked_by", "comments", "comments__author", "comments__amen_by"
        )
        category = self.request.query_params.get("category")
        if category and category != "all":
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        church = self.request.user.owned_churches.order_by("created_at").first()
        serializer.save(author=self.request.user, church=church)

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def _toggle(self, request, relation, response_key):
        post = self.get_object()
        members = getattr(post, relation)
        active = not members.filter(id=request.user.id).exists()
        if active:
            members.add(request.user)
        else:
            members.remove(request.user)
        return Response({response_key: active, f"{response_key}_count": members.count()})

    @action(detail=True, methods=["post"])
    def amen(self, request, pk=None):
        return self._toggle(request, "amen_by", "amens")

    @action(detail=True, methods=["post"])
    def pray(self, request, pk=None):
        return self._toggle(request, "prayed_by", "prayed")

    @action(detail=True, methods=["post"])
    def glory(self, request, pk=None):
        return self._toggle(request, "glory_by", "glory")

    @action(detail=True, methods=["post"])
    def bookmark(self, request, pk=None):
        return self._toggle(request, "bookmarked_by", "bookmarked")

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = CommunityCommentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        comment = CommunityComment.objects.create(post=post, author=request.user, content=serializer.validated_data["content"])
        return Response(CommunityCommentSerializer(comment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class GivingFundViewSet(viewsets.ModelViewSet):
    serializer_class = GivingFundSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("name", "description", "church__name")
    ordering_fields = ("sort_order", "name", "created_at")

    def get_queryset(self):
        queryset = GivingFund.objects.select_related("church").annotate(
            raised_amount=Coalesce(
                Sum("donations__amount", filter=Q(donations__status=Donation.Status.COMPLETED)),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            donor_count=Count("donations__donor", filter=Q(donations__status=Donation.Status.COMPLETED), distinct=True),
        ).order_by("sort_order", "name")
        if self.request.query_params.get("active") in ("1", "true", "True"):
            queryset = queryset.filter(is_active=True)
        return queryset

    def perform_create(self, serializer):
        church = serializer.validated_data["church"]
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create giving funds for your own church.")
        serializer.save()


class DonationViewSet(viewsets.ModelViewSet):
    serializer_class = DonationSerializer
    search_fields = ("donor_name", "donor_email", "fund__name", "church__name", "payment_reference")
    ordering_fields = ("created_at", "amount", "status")

    def get_queryset(self):
        queryset = Donation.objects.select_related("church", "fund", "donor")
        if not self.request.user.is_authenticated:
            return queryset.filter(is_anonymous=False, status=Donation.Status.COMPLETED)
        # Allow authenticated users to see donations they've made and donations for churches they own.
        return queryset.filter(Q(church__owner=self.request.user) | Q(donor=self.request.user)).distinct()

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        donor = self.request.user if self.request.user.is_authenticated else None
        serializer.save(donor=donor)

    def _resolve_checkout_church(self, serializer):
        church = serializer.validated_data.get("church")
        if church:
            return church
        user = self.request.user
        if user.is_authenticated:
            church = user.owned_churches.order_by("created_at").first()
            if church:
                return church
        church = Church.objects.order_by("created_at").first()
        if church:
            return church
        from rest_framework.exceptions import ValidationError
        raise ValidationError("Create a church before accepting donations.")

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def checkout(self, request):
        serializer = DonationCheckoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        church = self._resolve_checkout_church(serializer)
        fund = serializer.validated_data.get("fund")
        if fund is None:
            fund_name = serializer.validated_data["fund_name"].strip()
            fund, _ = GivingFund.objects.get_or_create(
                church=church,
                name=fund_name,
                defaults={"description": "Created from donor checkout.", "is_active": True},
            )
        donation = Donation.objects.create(
            church=church,
            fund=fund,
            donor=request.user if request.user.is_authenticated else None,
            donor_name=serializer.validated_data.get("donor_name", "").strip(),
            donor_email=serializer.validated_data.get("donor_email", "").strip(),
            amount=serializer.validated_data["amount"],
            currency=serializer.validated_data["currency"],
            frequency=serializer.validated_data["frequency"],
            status=Donation.Status.PENDING,
            is_anonymous=serializer.validated_data["is_anonymous"],
        )
        checkout = PaymentGatewayCheckout.objects.create(
            donation=donation,
            provider=serializer.validated_data["provider"],
            status=PaymentGatewayCheckout.Status.PENDING,
            metadata={"return_url": serializer.validated_data.get("return_url", "")},
        )
        checkout.checkout_url = request.build_absolute_uri(f"/donations/checkout/{checkout.gateway_reference}/")
        checkout.save(update_fields=["checkout_url"])
        return Response(PaymentGatewayCheckoutSerializer(checkout, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def confirm(self, request):
        reference = request.data.get("gateway_reference")
        if not reference:
            return Response({"gateway_reference": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            checkout = PaymentGatewayCheckout.objects.select_related("donation").get(gateway_reference=reference)
        except PaymentGatewayCheckout.DoesNotExist:
            return Response({"gateway_reference": ["Checkout was not found."]}, status=status.HTTP_404_NOT_FOUND)
        checkout.status = PaymentGatewayCheckout.Status.PAID
        checkout.save(update_fields=["status", "updated_at"])
        checkout.donation.status = Donation.Status.COMPLETED
        checkout.donation.payment_reference = str(checkout.gateway_reference)
        checkout.donation.save(update_fields=["status", "payment_reference"])
        return Response(PaymentGatewayCheckoutSerializer(checkout, context={"request": request}).data)


class WorshipSongViewSet(viewsets.ModelViewSet):
    serializer_class = WorshipSongSerializer
    permission_classes = [IsPastorOwnerOrReadOnly]
    search_fields = ("title", "author", "church__name")
    ordering_fields = ("title", "created_at", "updated_at")

    def get_queryset(self):
        queryset = WorshipSong.objects.select_related("church").prefetch_related("slides")
        if self.request.user.is_authenticated:
            return queryset.filter(Q(is_active=True) | Q(church__owner=self.request.user)).distinct()
        return queryset.filter(is_active=True)

    def perform_create(self, serializer):
        church = serializer.validated_data["church"]
        if church.owner_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create worship songs for your own church.")
        serializer.save()


class SavedSermonViewSet(viewsets.ModelViewSet):
    serializer_class = SavedSermonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedSermon.objects.filter(user=self.request.user).select_related("sermon", "sermon__church")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WatchProgressViewSet(viewsets.ModelViewSet):
    serializer_class = WatchProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WatchProgress.objects.filter(user=self.request.user).select_related("sermon", "sermon__church")

    def perform_create(self, serializer):
        progress, _ = WatchProgress.objects.update_or_create(
            user=self.request.user,
            sermon=serializer.validated_data["sermon"],
            defaults={
                "position_seconds": serializer.validated_data.get("position_seconds", 0),
                "completed": serializer.validated_data.get("completed", False),
            },
        )
        serializer.instance = progress
