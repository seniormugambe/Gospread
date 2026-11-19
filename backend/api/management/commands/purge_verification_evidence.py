from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import VerificationApplication


class Command(BaseCommand):
    help = "Delete verification evidence after its configured retention period."

    def handle(self, *args, **options):
        now = timezone.now()
        expired = VerificationApplication.objects.filter(
            evidence_expires_at__lte=now,
            evidence_purged_at__isnull=True,
        )
        count = expired.update(
            official_profile_url="",
            evidence_urls=[],
            evidence_notes="",
            appeal_evidence_urls=[],
            reviewer_notes="",
            evidence_purged_at=now,
            updated_at=now,
        )
        self.stdout.write(self.style.SUCCESS(f"Purged evidence for {count} verification application(s)."))
