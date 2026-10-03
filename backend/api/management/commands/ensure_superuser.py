"""
Management command: ensure_superuser

Creates or promotes a superuser from environment variables.
Safe to run on every deploy — idempotent.

Required env vars:
  DJANGO_SUPERUSER_EMAIL     e.g. admin@gospread.com
  DJANGO_SUPERUSER_PASSWORD  e.g. a strong password

Optional:
  DJANGO_SUPERUSER_USERNAME  defaults to the email local-part
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Idempotently create or promote a superuser from environment variables."

    def handle(self, *args, **options):
        User = get_user_model()

        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip().lower()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "").strip()
        username = os.environ.get(
            "DJANGO_SUPERUSER_USERNAME",
            email.split("@")[0] if email else "admin",
        ).strip()

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "ensure_superuser: DJANGO_SUPERUSER_EMAIL or "
                    "DJANGO_SUPERUSER_PASSWORD not set — skipping."
                )
            )
            return

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username},
        )

        if created:
            user.set_password(password)
            self.stdout.write(self.style.SUCCESS(f"Created superuser: {email}"))
        else:
            self.stdout.write(f"User already exists: {email} — updating password & permissions.")
            user.set_password(password)
            # Ensure username is set (may be blank on old accounts)
            if not user.username:
                user.username = username

        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        self.stdout.write(self.style.SUCCESS(f"Superuser ready: {email}"))
