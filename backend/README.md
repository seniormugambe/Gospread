# Gospread API

Django REST API for the Gospread Gospel streaming application.

## Local setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/` and the admin at `http://127.0.0.1:8000/admin/`.

## Authentication

- `POST /api/auth/signup/` — create a user (optional `church_name` creates a church)
- `POST /api/auth/token/` — obtain access and refresh JWTs using `email` and `password`
- `POST /api/auth/token/refresh/` — refresh an access token
- `POST /api/auth/logout/` — revoke a refresh token
- `GET/PATCH /api/auth/me/` — current profile
- `POST /api/auth/change-password/` — securely change the signed-in user's password
- `GET /api/scriptures/random/` — a random active scripture for the login hero

Authenticated requests use `Authorization: Bearer <access-token>`.
Refresh tokens rotate automatically and are blacklisted after use. The React client restores sessions, refreshes expired access tokens, protects role-specific routes, and revokes the refresh token during sign-out.

Public read endpoints include the health check, random scripture, published ministry content, and church discovery. Account changes, community interactions, prayer actions, saved sermons, watch progress, ministry management, and donation checkout require an authenticated user.

## Resources

- `/api/churches/`
- `/api/sermons/`
- `/api/sermons/discover/?surface=home|explore|sermons|following`
- `/api/discovery/config/` — public pilot feature-flag state
- `/api/discovery/fairness-report/` — staff-only aggregate weekly fairness report
- `POST /api/sermons/{id}/heartbeat/` — authenticated, deduplicated playback heartbeat
- `POST /api/sermons/uploads/` — create or resume an authenticated video upload session
- `PUT /api/sermons/uploads/{upload_id}/chunks/` — append a chunk using the `Upload-Offset` header
- `POST /api/sermons/uploads/{upload_id}/complete/` — validate and publish/save the uploaded sermon
- `/api/shorts/` — sermon clips up to three minutes
- `/api/streams/?status=live`
- `/api/prayers/`
- `/api/saved/`
- `/api/progress/`

The initial migration includes a small public-domain KJV scripture library. Staff can add, edit, or deactivate scriptures through Django Admin.

Search list endpoints with `?search=faith` and paginate with `?page=2`.

Discovery v2.2 is integrated as a staged pilot for published sermons. `DISCOVERY_ALGORITHM_ENABLED` and `DISCOVERY_EVENTS_ENABLED` both default to `false`; while ranking is disabled, the discovery endpoint preserves the existing newest-first sermon order, and while event ingestion is disabled, no playback events are stored. Ranked Discovery returns `503` unless event ingestion is enabled as well. Enable both settings only in a private pilot environment after reviewing the proposal and its safety requirements. Following stays chronological, Prayer Altar content is excluded from ranking and playback metrics, and no Standing score or public percentile is produced. The staff-only fairness report aggregates the most recent seven days and the preceding week; it returns no viewer or church identifiers. Cold-start and non-cold-start view rates are item-level diagnostics, not impression-attributed or matched causal comparisons. Shorts/live-specific calibration and Standing remain unimplemented pending their required trusted signals and pilot review.

When event ingestion is enabled, authenticated sermon playback clients submit a heartbeat every 15 seconds. Events are stored in a per-user browser queue while offline and retried when connectivity returns. The API deduplicates client event UUIDs and only accrues qualified watch time when server receipt intervals and forward playback positions are plausible. The first heartbeat establishes a baseline and earns no watch time; gaps over 60 seconds and implausible jumps are not counted. Backfilled offline events are retained for audit but do not earn watch time unless they meet the same server-side interval rules. The pilot ranker uses neutral Quality and Trust values until their authoritative signals exist. The initial pilot therefore must not be treated as calibrated ranking or as approval to publish Standing.

Video upload sessions accept files up to 10 GB in 8 MiB chunks and expire after 24 hours. The Creator Studio stores the session ID in the current browser session so a retry with the same file resumes from the last server-confirmed byte offset. Configure the deployment's request-body limit to allow an 8 MiB chunk.
Partial chunks are stored under `MEDIA_ROOT/resumable_uploads`; use persistent shared storage before running multiple API instances or expecting in-flight uploads to survive an instance replacement.

Scheduled sermons remain unpublished until their scheduled time. Sermon-feed requests publish overdue entries; deployments that need publication even when no feed is requested should run `python manage.py publish_scheduled_sermons` periodically.

The Render prototype can start without `DATABASE_URL`; Django then uses SQLite at `backend/db.sqlite3`. Render's default service filesystem is ephemeral, so SQLite data can be lost when the instance is replaced or redeployed and is not suitable for durable accounts. When switching to PostgreSQL, set `DATABASE_URL` in the Render service environment (or link it to a Render database); Django will use it automatically.
