from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Church, ChurchEvent, Donation, GivingFund, LiveStream, PaymentGatewayCheckout, Scripture, Sermon, SermonShort, User


class AuthenticationTests(APITestCase):
    def test_pastor_signup_creates_church_and_can_login(self):
        response = self.client.post(reverse("signup"), {
            "email": "pastor@example.com",
            "password": "StrongPass123!",
            "name": "Mary Kamau",
            "church_name": "Grace Community",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Church.objects.filter(name="Grace Community", owner__email="pastor@example.com").exists())

        token = self.client.post(reverse("token"), {
            "email": "pastor@example.com",
            "password": "StrongPass123!",
        }, format="json")
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.assertIn("access", token.data)
        self.assertEqual(token.data["user"]["church_name"], "Grace Community")

    def test_congregant_signup_does_not_create_church(self):
        response = self.client.post(reverse("signup"), {
            "email": "member@example.com",
            "password": "StrongPass123!",
            "name": "John Member",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="member@example.com").exists())
        self.assertEqual(Church.objects.count(), 0)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        User.objects.create_user(username="member", email="logout@example.com", password="StrongPass123!")
        token = self.client.post(reverse("token"), {"email": "LOGOUT@example.com", "password": "StrongPass123!"}, format="json")

        logout = self.client.post(reverse("logout"), {"refresh": token.data["refresh"]}, format="json")
        reuse = self.client.post(reverse("token-refresh"), {"refresh": token.data["refresh"]}, format="json")

        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(reuse.status_code, status.HTTP_401_UNAUTHORIZED)


class ScriptureTests(APITestCase):
    def test_random_scripture_is_public(self):
        response = self.client.get(reverse("random-scripture"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Scripture.objects.filter(reference=response.data["reference"]).exists())
        self.assertEqual(response.data["translation"], "KJV")

    def test_random_scripture_can_exclude_previous_login_verse(self):
        previous = Scripture.objects.first()
        response = self.client.get(reverse("random-scripture"), {"exclude": previous.reference})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data["reference"], previous.reference)


class SermonShortTests(APITestCase):
    def test_published_shorts_are_public(self):
        pastor = User.objects.create_user(username="shorts-pastor", email="shorts@example.com", password="StrongPass123!")
        church = Church.objects.create(name="Shorts Church", slug="shorts-church", owner=pastor)
        SermonShort.objects.create(
            church=church,
            title="Grace for today",
            speaker="Pastor Mary",
            caption="There is fresh grace for today.",
            thumbnail_url="https://example.com/short.jpg",
            duration_seconds=45,
            is_published=True,
        )

        response = self.client.get("/api/v1/shorts/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Grace for today")

    def test_pastor_can_upload_a_sermon_file_directly(self):
        pastor = User.objects.create_user(username="upload-pastor", email="upload@example.com", password="StrongPass123!")
        church = Church.objects.create(name="Upload Church", slug="upload-church", owner=pastor)
        token = self.client.post(reverse("token"), {"email": "upload@example.com", "password": "StrongPass123!"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

        file_upload = SimpleUploadedFile("sermon.mp4", b"video-bytes", content_type="video/mp4")
        response = self.client.post("/api/v1/sermons/", {
            "church": church.id,
            "title": "Uploaded sermon",
            "speaker": "Pastor Upload",
            "kind": "video",
            "media_file": file_upload,
            "is_published": True,
        }, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["media_url"].startswith("http"))
        self.assertTrue(Sermon.objects.get(id=response.data["id"]).media_url)


class ChurchEntryTests(APITestCase):
    def test_church_detail_includes_pastor_stars_media_and_schedule(self):
        pastor = User.objects.create_user(
            username="entry-pastor",
            email="entry@example.com",
            password="StrongPass123!",
            first_name="Mary",
            last_name="Kamau",
        )
        church = Church.objects.create(
            name="Entry Church",
            slug="entry-church",
            owner=pastor,
            description="A church for the city.",
        )
        Sermon.objects.create(
            church=church,
            title="Hope for the city",
            speaker="Pastor Mary",
            media_url="https://example.com/hope.mp4",
            thumbnail_url="https://example.com/hope.jpg",
            is_published=True,
            is_featured=True,
            published_at=timezone.now(),
        )
        SermonShort.objects.create(
            church=church,
            title="One minute of hope",
            speaker="Worship Leader Jane",
            thumbnail_url="https://example.com/short.jpg",
            is_published=True,
        )
        stream = LiveStream.objects.create(
            church=church,
            title="Sunday service",
            status=LiveStream.Status.SCHEDULED,
            scheduled_for=timezone.now() + timedelta(days=1),
        )
        ChurchEvent.objects.create(
            church=church,
            stream=stream,
            title="Sunday worship",
            event_type=ChurchEvent.EventType.SERVICE,
            starts_at=timezone.now() + timedelta(days=1),
            location="Main sanctuary",
            is_featured=True,
        )

        response = self.client.get("/api/v1/churches/entry-church/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["head_pastor"]["name"], "Mary Kamau")
        self.assertEqual(response.data["head_pastor"]["title"], "Head Pastor")
        self.assertGreaterEqual(len(response.data["top_stars"]), 2)
        self.assertEqual(response.data["media"][0]["title"], "One minute of hope")
        self.assertEqual(response.data["schedule"][0]["title"], "Sunday worship")
        self.assertEqual(response.data["schedule"][0]["stream_status"], LiveStream.Status.SCHEDULED)

    def test_media_posts_require_a_church(self):
        pastor = User.objects.create_user(
            username="churchless-pastor",
            email="churchless@example.com",
            password="StrongPass123!",
        )
        token = self.client.post(reverse("token"), {"email": "churchless@example.com", "password": "StrongPass123!"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

        sermon = self.client.post("/api/v1/sermons/", {
            "title": "Churchless media",
            "speaker": "Pastor Without Church",
            "kind": "video",
            "is_published": True,
        }, format="json")
        short = self.client.post("/api/v1/shorts/", {
            "title": "Churchless short",
            "speaker": "Pastor Without Church",
            "thumbnail_url": "https://example.com/churchless.jpg",
            "is_published": True,
        }, format="json")

        self.assertEqual(sermon.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("church", sermon.data)
        self.assertEqual(short.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("church", short.data)


class MinistryFeatureTests(APITestCase):
    def test_authenticated_user_can_create_church_without_slug(self):
        pastor = User.objects.create_user(
            username="create-church-pastor",
            email="createchurch@example.com",
            password="StrongPass123!",
        )
        token = self.client.post(reverse("token"), {"email": "createchurch@example.com", "password": "StrongPass123!"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

        response = self.client.post("/api/v1/churches/", {
            "name": "New Gospel Center",
            "description": "A welcoming church for the city.",
            "location": "Nairobi",
            "ministry_focus": "Youth and worship",
            "email": "hello@newgospel.org",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Gospel Center")
        self.assertEqual(response.data["slug"], "new-gospel-center")
        self.assertEqual(response.data["owner"], pastor.id)

    def setUp(self):
        self.pastor = User.objects.create_user(
            username="feature-pastor",
            email="features@example.com",
            password="StrongPass123!",
        )
        self.church = Church.objects.create(name="Feature Church", slug="feature-church", owner=self.pastor)
        token = self.client.post(reverse("token"), {"email": "features@example.com", "password": "StrongPass123!"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

    def test_pastor_can_create_worship_song_with_slides(self):
        response = self.client.post("/api/v1/worship-songs/", {
            "church": self.church.id,
            "title": "Amazing Grace",
            "author": "John Newton",
            "key": "G",
            "slides": [
                {"order": 1, "text": "Amazing grace"},
                {"order": 2, "text": "Through many dangers"},
            ],
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Amazing Grace")
        self.assertEqual(len(response.data["slides"]), 2)

    def test_giving_funds_include_completed_donation_totals(self):
        fund = GivingFund.objects.create(church=self.church, name="Missions", goal_amount=1000)
        Donation.objects.create(
            church=self.church,
            fund=fund,
            donor=self.pastor,
            amount=25,
            status=Donation.Status.COMPLETED,
        )

        response = self.client.get("/api/v1/giving-funds/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["name"], "Missions")
        self.assertEqual(response.data["results"][0]["raised_amount"], "25.00")

    def test_donor_checkout_creates_pending_donation_and_can_confirm(self):
        fund = GivingFund.objects.create(church=self.church, name="Tithes & Offerings", goal_amount=1000)

        checkout = self.client.post("/api/v1/donations/checkout/", {
            "fund": fund.id,
            "amount": "50.00",
            "currency": "usd",
            "frequency": "one_time",
            "donor_name": "Jane Donor",
            "donor_email": "jane@example.com",
        }, format="json")

        self.assertEqual(checkout.status_code, status.HTTP_201_CREATED)
        self.assertEqual(checkout.data["status"], PaymentGatewayCheckout.Status.PENDING)
        self.assertEqual(checkout.data["donation"]["status"], Donation.Status.PENDING)

        confirm = self.client.post("/api/v1/donations/confirm/", {
            "gateway_reference": checkout.data["gateway_reference"],
        }, format="json")

        self.assertEqual(confirm.status_code, status.HTTP_200_OK)
        self.assertEqual(confirm.data["status"], PaymentGatewayCheckout.Status.PAID)
        self.assertEqual(confirm.data["donation"]["status"], Donation.Status.COMPLETED)
