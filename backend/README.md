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
- `POST /api/auth/email/verification/` — resend the signed-in user's email verification link (one-minute cooldown)
- `POST /api/auth/email/verify/` — confirm an email using the one-time link token
- `GET/PATCH /api/auth/me/` — current profile
- `POST /api/auth/change-password/` — securely change the signed-in user's password
- `GET /api/scriptures/random/` — a random active scripture for the login hero

Authenticated requests use `Authorization: Bearer <access-token>`.
Refresh tokens rotate automatically and are blacklisted after use. The React client restores sessions, refreshes expired access tokens, protects role-specific routes, and revokes the refresh token during sign-out.

Public read endpoints include the health check, random scripture, published ministry content, and church discovery. Account changes, community interactions, prayer actions, saved sermons, watch progress, ministry management, and donation checkout require an authenticated user.

## Profile verification

- `GET/POST /api/verification/application/` — view or submit a Ministry, Artiste, or Creator verification application
- `POST /api/verification/application/appeal/` — appeal a rejected application with a reason and optional new evidence links
- Email verification is required before applying. Phone OTP is not enabled.
- Applications accept public evidence links and notes only; do not submit identity documents. Uploaded evidence is disabled until private object storage is configured.
- Staff with verification-application permissions review applications in Django Admin. Decision reasons are shown to applicants and status changes are audited.
- Appeals have no time limit until an appeal period is approved. After a rejection, applicants may also reapply with updated evidence.
- Public verified indicators are derived only from an approved application for the user's current onboarding category; `is_featured` and completed onboarding are not verification.
- `VERIFICATION_EVIDENCE_RETENTION_DAYS` defaults to 5. Schedule `python manage.py purge_verification_evidence` to run daily in the deployment environment; the command clears evidence links and notes after the configured period while preserving the decision and status history. No scheduled job is created automatically by the current Render web-service configuration.

Email verification uses the configured Django email backend and `FRONTEND_URL`. In production, configure the SMTP environment variables so sign-up verification links can be delivered.

## Resources

- `/api/churches/`
- `GET /api/profiles/{username}/` — public name, username, avatar, bio, and role for an active account; no private account fields
- `/api/sermons/`
- `/api/sermons/discover/?surface=home|explore|sermons|following`
- `/api/discovery/config/` — public pilot feature-flag state
- `/api/discovery/fairness-report/` — staff-only aggregate weekly fairness report
- `GET /api/analytics/?range=7d|28d|90d|all` — authenticated creator metrics for owned public sermons and completed donations
- `POST /api/sermons/{id}/heartbeat/` — authenticated, deduplicated playback heartbeat
- `POST /api/sermons/uploads/` — create or resume an authenticated upload session; unfinished uploads can resume within 24 hours after a browser restart when the creator reselects the same file, and metadata can be revised until completion
- `PUT /api/sermons/uploads/{upload_id}/chunks/` — append a chunk using the `Upload-Offset` header
- `POST /api/sermons/uploads/{upload_id}/complete/` — validate and publish/save the uploaded sermon
- `/api/shorts/` — sermon clips up to three minutes
- `/api/streams/?status=live`
- `/api/prayers/`
- `/api/saved/`
- `/api/progress/`

The initial migration includes a small public-domain KJV scripture library. Staff can add, edit, or deactivate scriptures through Django Admin.

Search list endpoints with `?search=faith` and paginate with `?page=2`.

Creator analytics are scoped to churches owned by the authenticated creator. Lifetime and period playback-session counts, distinct signed-in viewers, qualified sessions, and accepted watch time come from authenticated playback events. Completed donations use the selected period, are grouped by currency, and exclude pending, failed, and refunded records. Playback analytics tracking defaults to disabled outside the Render API configuration; when disabled, watch-time and playback-session metrics are reported as unavailable. No historical watch time is backfilled. The Render API service enables `PLAYBACK_ANALYTICS_ENABLED`; it is separate from discovery ranking.

Discovery v2.2 is integrated as a staged pilot for published sermons. `DISCOVERY_ALGORITHM_ENABLED` and `DISCOVERY_EVENTS_ENABLED` default to `false`; while ranking is disabled, discovery preserves newest-first order, and ranked Discovery returns `503` unless both flags are enabled. Enable those settings only in a private pilot after reviewing the proposal and its safety requirements. Following stays chronological, Prayer Altar content is excluded from ranking and playback metrics, and no Standing score or public percentile is produced. The staff-only fairness report aggregates weekly data without viewer or church identifiers. Shorts/live-specific calibration and Standing remain unimplemented pending trusted signals and pilot review.

When playback analytics or discovery event collection is enabled, authenticated sermon players submit a heartbeat every 15 seconds. Events are stored in a per-user browser queue while offline and retried when connectivity returns. The API deduplicates client event UUIDs and only accrues watch time when server receipt intervals and forward playback positions are plausible. The first heartbeat establishes a baseline and earns no watch time; gaps over 60 seconds and implausible jumps are not counted. Backfilled offline events are retained for audit but do not earn watch time unless they meet the same server-side interval rules. Analytics use this conservative accepted-watch-time total; they are not calibrated ranking or approval to publish Standing.

Video upload sessions accept files up to 10 GB in 8 MiB chunks and expire after 24 hours. The Creator Studio stores the session ID in the current browser session so a retry with the same file resumes from the last server-confirmed byte offset. Configure the deployment's request-body limit to allow an 8 MiB chunk.
Partial chunks are stored under `MEDIA_ROOT/resumable_uploads`; use persistent shared storage before running multiple API instances or expecting in-flight uploads to survive an instance replacement.

Scheduled sermons remain unpublished until their scheduled time. The Render Blueprint includes a paid Cron service that runs `python manage.py publish_scheduled_sermons` every five minutes; feed requests also publish overdue entries as a fallback. Check Render's current compute pricing before syncing the Cron service, and set its `DATABASE_URL` to the same shared PostgreSQL database used by `gospread-api`. The command exits with an explicit error if `DATABASE_URL` is unset, because its local SQLite database would not publish content for the API service. For local/manual operation, run the command from `backend/` as needed.

The Render prototype can start without `DATABASE_URL`; Django then uses SQLite at `backend/db.sqlite3`. Render's default service filesystem is ephemeral, so SQLite data can be lost when the instance is replaced or redeployed and is not suitable for durable accounts. When switching to PostgreSQL, set `DATABASE_URL` in the Render service environment (or link it to a Render database); Django will use it automatically. Database migrations run when the API service starts, not during the build. If the service cannot resolve the database hostname at startup, verify that `DATABASE_URL` uses the current database's internal URL and that the database and API service are in the same Render region.

The Render API blueprint mounts a persistent disk at `/var/data` and sets `MEDIA_ROOT` to that path so uploaded profile photos and media remain available after restarts and deploys. Render persistent disks require a paid web-service plan. Keep the disk mount path and `MEDIA_ROOT` aligned if either is changed.
