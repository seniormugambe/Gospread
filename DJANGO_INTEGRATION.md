# 🐍 Gospread Gospel Platform - Django Backend Architecture & Integration Guide

This master reference specifies everything that is handled on the **Django 4.2+ / 5.x Backend** for the **Gospread Global Gospel Platform**, powered by **Django REST Framework (DRF)**, **SimpleJWT**, and **Django Channels (WebSockets)**.

---

## 🏛️ 1. Project Directory Structure

A modular, scalable Django project structure organized by domain apps:

```text
gospread_backend/
├── manage.py
├── gospread_core/
│   ├── __init__.py
│   ├── asgi.py              # ASGI for HTTP + WebSockets (Channels)
│   ├── wsgi.py
│   ├── urls.py              # Root URL routing /api/v1/
│   └── settings.py          # CORS, SimpleJWT, Database, Channels
├── apps/
│   ├── accounts/            # User profiles, Grace Streaks, Faith Badges, Praise XP
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── signals.py       # Automated badge unlock signals
│   │   └── urls.py
│   ├── churches/            # Ministries, Multi-Campus locations & Google Maps links
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── streams/             # Live video streams, Grace Shorts, audio podcasts & 24/7 radio
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── giving/              # Tithes, Seed Faith, Super Amen, Partner Pass, Webhooks & Tax Receipts
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── rankings/            # Spiritual Momentum score calculator & Badge Earners Leaderboard
│   │   ├── services.py      # Momentum weighting algorithm
│   │   ├── views.py
│   │   └── urls.py
│   └── interactivity/       # Live altar chat, Amen reactions, prayer requests & sermon notes
│       ├── consumers.py     # Django Channels WebSocket consumer
│       ├── routing.py
│       ├── models.py
│       └── views.py
└── requirements.txt
```

---

## 📦 2. Python Dependencies (`requirements.txt`)

```text
django>=5.0,<5.2
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
channels>=4.0.0
channels-redis>=4.2.0
psycopg2-binary>=2.9.9
gunicorn>=22.0.0
uvicorn[standard]>=0.30.0
celery>=5.4.0
redis>=5.0.4
pillow>=10.3.0
```

---

## 🗄️ 3. Complete Django Models Schema (`models.py`)

### A. Accounts & Spiritual Discipline (`apps/accounts/models.py`)

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('believer', 'Global Believer'),
        ('creator', 'Gospel Creator'),
        ('pastor', 'Pastor / Church Leader'),
        ('artiste', 'Gospel Artiste / Psalmist'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='believer')
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    home_church = models.CharField(max_length=255, blank=True)
    praise_xp = models.IntegerField(default=100)
    streak_days = models.IntegerField(default=1)
    last_devotion_date = models.DateField(default=timezone.now)
    total_study_minutes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class FaithBadge(models.Model):
    TIER_CHOICES = [('Bronze', 'Bronze'), ('Silver', 'Silver'), ('Gold', 'Gold')]
    name = models.CharField(max_length=100, unique=True) # e.g. "Global Intercessor", "7-Day Overcomer"
    icon = models.CharField(max_length=10) # e.g. ⚡, 👑, 🔥, 🌾
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='Bronze')
    category = models.CharField(max_length=50) # e.g. "Prayer", "Streak", "Giving", "Discipleship"
    description = models.TextField()

    def __str__(self):
        return f"{self.icon} {self.name} ({self.tier})"

class UserBadgeAward(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(FaithBadge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')
```

### B. Churches & Multi-Campus Locations (`apps/churches/models.py`)

```python
from django.db import models

class Church(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100) # e.g. "Charismatic Worship", "Cathedral"
    lead_pastor = models.CharField(max_length=255)
    avatar = models.URLField(blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    verified = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ChurchCampus(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name='campuses')
    campus_name = models.CharField(max_length=255) # e.g. "Main Sanctuary (Southwest)", "North Woodlands Branch"
    address = models.CharField(max_length=255)
    city_state = models.CharField(max_length=150)
    country = models.CharField(max_length=100, default='USA')
    google_maps_url = models.URLField(blank=True) # Direct Google Maps coordinates or link
    service_times = models.CharField(max_length=255) # e.g. "Sun 8:30 AM & 11:00 AM | Wed 7:00 PM"
    pastor_or_leader = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    is_main_campus = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.church.name} - {self.campus_name}"
```

### C. Live Video Streams, Podcasts & Shorts (`apps/streams/models.py`)

```python
from django.db import models

class VideoStream(models.Model):
    title = models.CharField(max_length=255)
    speaker_or_artist = models.CharField(max_length=255)
    church_or_ministry = models.CharField(max_length=255)
    channel_avatar = models.URLField()
    category = models.CharField(max_length=100)
    is_live = models.BooleanField(default=False)
    is_short = models.BooleanField(default=False)
    viewers_count = models.IntegerField(default=0)
    likes_count = models.CharField(max_length=50, default='0')
    thumbnail = models.URLField()
    video_url = models.URLField(blank=True) # YouTube Embed or HLS m3u8 stream
    description = models.TextField()
    bible_verse = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AudioTrack(models.Model):
    title = models.CharField(max_length=255)
    artist_or_preacher = models.CharField(max_length=255)
    album_or_series = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    cover_url = models.URLField()
    audio_url = models.URLField(blank=True)
    duration = models.CharField(max_length=50)
    is_live_radio = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### D. Giving & Tithe Ledger (`apps/giving/models.py`)

```python
from django.db import models
from django.contrib.auth.models import User

class Donation(models.Model):
    FUND_CHOICES = [
        ('Tithe', 'Tithe'),
        ('Offering', 'Kingdom Offering'),
        ('Seed Faith', 'Seed Faith Offering'),
        ('Super Amen', 'Super Amen Altar'),
        ('Partner Pass', 'Kingdom Partner Monthly Pass'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    ministry_name = models.CharField(max_length=255)
    fund_type = models.CharField(max_length=50, choices=FUND_CHOICES, default='Tithe')
    is_recurring = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, default='card') # card, apple_pay, paypal, mobile_money
    donor_name = models.CharField(max_length=255, default='Anonymous Partner')
    donor_email = models.EmailField(blank=True)
    prayer_note = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## ⚡ 4. DRF Serializers & ViewSets (`serializers.py` & `views.py`)

### `apps/churches/serializers.py`
```python
from rest_framework import serializers
from .models import Church, ChurchCampus

class ChurchCampusSerializer(serializers.ModelSerializer):
    campusName = serializers.CharField(source='campus_name')
    cityState = serializers.CharField(source='city_state')
    googleMapsUrl = serializers.URLField(source='google_maps_url', required=False, allow_blank=True)
    serviceTimes = serializers.CharField(source='service_times')
    isMainCampus = serializers.BooleanField(source='is_main_campus')

    class Meta:
        model = ChurchCampus
        fields = ['id', 'campusName', 'address', 'cityState', 'country', 'googleMapsUrl', 'serviceTimes', 'isMainCampus']

class ChurchSerializer(serializers.ModelSerializer):
    campuses = ChurchCampusSerializer(many=True, required=False)
    leadPastor = serializers.CharField(source='lead_pastor')

    class Meta:
        model = Church
        fields = ['id', 'name', 'category', 'leadPastor', 'avatar', 'website', 'phone', 'email', 'verified', 'campuses']

    def create(self, validated_data):
        campuses_data = validated_data.pop('campuses', [])
        church = Church.objects.create(**validated_data)
        for campus_data in campuses_data:
            ChurchCampus.objects.create(church=church, **campus_data)
        return church
```

### `apps/giving/views.py`
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
from .models import Donation

class ProcessDonationView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        ministry_name = request.data.get('ministry_name', 'Gospread Global Mission')
        fund_type = request.data.get('fund_type', 'Tithe')

        if not amount or float(amount) <= 0:
            return Response({'error': 'Valid donation amount is required'}, status=status.HTTP_400_BAD_REQUEST)

        txn_id = f"TXN-DJ-{uuid.uuid4().hex[:8].upper()}"
        receipt = f"https://gospread.org/receipts/{txn_id}"

        donation = Donation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            transaction_id=txn_id,
            amount=amount,
            ministry_name=ministry_name,
            fund_type=fund_type,
            is_recurring=request.data.get('is_recurring', False),
            payment_method=request.data.get('payment_method', 'card'),
            donor_name=request.data.get('donor_name', 'Anonymous Partner'),
            donor_email=request.data.get('donor_email', ''),
            prayer_note=request.data.get('prayer_note', ''),
            receipt_url=receipt,
            status='completed'
        )

        return Response({
            'success': True,
            'transactionId': txn_id,
            'amount': float(amount),
            'ministryName': ministry_name,
            'receiptUrl': receipt,
            'message': f"Your {fund_type} of ${amount} to {ministry_name} was securely recorded on Django."
        }, status=status.HTTP_201_CREATED)
```

---

## 📡 5. Complete REST API Endpoints Specification

| Area | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login/` | JWT token exchange + profile with faith badges |
| **Auth** | `POST` | `/api/v1/auth/register/` | Believer/Creator registration |
| **Streak** | `POST` | `/api/v1/auth/streak/checkin/` | Daily grace checkin (+50 XP, badge progression) |
| **Churches**| `GET` | `/api/v1/churches/?q=atlanta` | Directory search with campuses & Google Maps |
| **Churches**| `POST` | `/api/v1/churches/register/` | Register church with optional multi-campus links |
| **Streams** | `GET` | `/api/v1/videos/?category=...` | List live video streams & sermons |
| **Audio** | `GET` | `/api/v1/podcasts/` | Audio sermons, gospel music & series |
| **Giving** | `POST` | `/api/v1/giving/donate/` | Process Tithe, Seed, Super Amen, Partner Pass |
| **Giving** | `GET` | `/api/v1/giving/history/` | User donation ledger & PDF receipt links |
| **Rankings**| `GET` | `/api/v1/rankings/believers/` | Spiritual momentum leaderboard for badge earners |
| **Prayer** | `POST` | `/api/v1/interactivity/prayers/`| Submit global prayer altar requests |

---

## 📻 6. Django Channels WebSockets for Live Altar Chat (`consumers.py`)

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AltarStreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        self.room_group_name = f'stream_{self.stream_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type') # 'chat_message', 'super_amen', 'prayer_point'
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_event',
                'payload': data
            }
        )

    async def broadcast_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))
```

---

## 🛡️ 7. Frontend Integration & Connection Switch

In your `.env` file, point to your local or deployed Django server:

```env
VITE_DJANGO_API_URL="http://localhost:8000/api/v1"
```

The React frontend (`src/services/djangoApi.ts`) automatically:
1. Passes JWT `Authorization: Bearer <token>` and `X-CSRFToken` headers.
2. Formats multi-campus church models and Google Maps URLs.
3. Automatically falls back to resilient local states if the Django server is offline during development.
