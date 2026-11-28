from datetime import timedelta
from pathlib import Path
import os

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-change-me-before-production")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"
render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME")
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,.onrender.com",
    ).split(",")
    if host.strip()
]
if render_hostname:
    ALLOWED_HOSTS.append(render_hostname)

if os.getenv("RENDER"):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_PRELOAD = True

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "").strip().rstrip("/")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "").strip()
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "").strip()
AWS_IVS_REGION = os.getenv("AWS_IVS_REGION", os.getenv("AWS_REGION", "us-east-1")).strip()
DISCOVERY_ALGORITHM_ENABLED = os.getenv("DISCOVERY_ALGORITHM_ENABLED", "false").strip().lower() == "true"
DISCOVERY_EVENTS_ENABLED = os.getenv("DISCOVERY_EVENTS_ENABLED", "false").strip().lower() == "true"
PLAYBACK_ANALYTICS_ENABLED = os.getenv("PLAYBACK_ANALYTICS_ENABLED", "false").strip().lower() == "true"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT") or BASE_DIR / "media")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "api.User"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Gospread <no-reply@gospread.org>")
VERIFICATION_EVIDENCE_RETENTION_DAYS = int(os.getenv("VERIFICATION_EVIDENCE_RETENTION_DAYS", "5"))

# Use email-based authentication instead of Django's default username lookup.
# SimpleJWT's TokenObtainPairSerializer calls django.contrib.auth.authenticate()
# which forwards credentials as username= — EmailBackend resolves that to the
# email field so login works correctly.
AUTHENTICATION_BACKENDS = [
    "api.backends.EmailBackend",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "upload-offset",
]
CORS_EXPOSE_HEADERS = ["upload-offset"]
DATA_UPLOAD_MAX_MEMORY_SIZE = 8 * 1024 * 1024 + 1024
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080,http://192.168.100.60:8080,http://192.168.100.60:8081",
    ).split(",")
    if origin.strip()
]
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080,http://192.168.100.60:8080,http://192.168.100.60:8081",
    ).split(",")
    if origin.strip()
]

if os.getenv("RENDER"):
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https://.*\.onrender\.com$",
        r"^http://.*\.onrender\.com$",
    ]
    CSRF_TRUSTED_ORIGINS = [
        *CSRF_TRUSTED_ORIGINS,
        "https://*.onrender.com",
        "http://*.onrender.com",
    ]

# During development allow all origins when DEBUG is true so local dev servers
# on different ports or network addresses can access the API without extra
# configuration. In production, DEBUG should be false and this will be disabled.
CORS_ALLOW_ALL_ORIGINS = DEBUG
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticatedOrReadOnly",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": ("rest_framework.filters.SearchFilter", "rest_framework.filters.OrderingFilter"),
    "DEFAULT_THROTTLE_RATES": {"feedback": "5/hour"},
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}
# Cloudflare R2 media storage for Django.
# Paste into settings.py (after the existing MEDIA_URL / MEDIA_ROOT lines; keep those, they are
# still used for the temporary chunk files in views.py).
#
# requirements.txt additions:
#   django-storages[s3]>=1.14
#   boto3>=1.34
#
# Render > Environment variables to add:
#   R2_ACCOUNT_ID         Cloudflare account ID (R2 overview page)
#   R2_ACCESS_KEY_ID      from an R2 API token (Object Read & Write, limited to your bucket)
#   R2_SECRET_ACCESS_KEY  from the same token
#   R2_BUCKET_NAME        e.g. gospread-media
#   R2_PUBLIC_DOMAIN      the bucket's public domain WITHOUT https://,
#                         e.g. pub-xxxxxxxx.r2.dev  or  media.yourdomain.com



R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME")

if R2_BUCKET_NAME:
    # Production (Render): all FileField / ImageField uploads go to R2.
    AWS_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"]
    AWS_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"]
    AWS_STORAGE_BUCKET_NAME = R2_BUCKET_NAME
    AWS_S3_ENDPOINT_URL = f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"    AWS_S3_REGION_NAME = "auto"
    AWS_S3_SIGNATURE_VERSION = "s3v4"

    # Public URLs served straight from Cloudflare (supports Range requests for video seeking).
    AWS_S3_CUSTOM_DOMAIN = os.environ["R2_PUBLIC_DOMAIN"]
    AWS_QUERYSTRING_AUTH = False      # plain public URLs, no signed query strings
    AWS_DEFAULT_ACL = None            # R2 does not use ACLs
    AWS_S3_FILE_OVERWRITE = False     # never silently replace an existing object
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "public, max-age=31536000, immutable"}

    # Django 4.2+. If you already define STORAGES, change only the "default" entry
    # and keep your existing "staticfiles" backend.
    STORAGES = {
        "default": {"BACKEND": "storages.backends.s3.S3Storage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }
    # Django < 4.2 instead:
    # DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
else:
    # Local development: files stay on disk under MEDIA_ROOT, as before.
    pass