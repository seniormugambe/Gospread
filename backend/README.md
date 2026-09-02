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
- `/api/shorts/` — sermon clips up to three minutes
- `/api/streams/?status=live`
- `/api/prayers/`
- `/api/saved/`
- `/api/progress/`

The initial migration includes a small public-domain KJV scripture library. Staff can add, edit, or deactivate scriptures through Django Admin.

Search list endpoints with `?search=faith` and paginate with `?page=2`.
