from django.core.management.base import BaseCommand
from django.db.models import F
from django.utils import timezone

from api.models import Sermon


class Command(BaseCommand):
    help = "Publish scheduled sermons whose publication time has arrived."

    def handle(self, *args, **options):
        published_count = Sermon.objects.filter(
            is_published=False,
            scheduled_for__isnull=False,
            scheduled_for__lte=timezone.now(),
        ).update(is_published=True, published_at=F("scheduled_for"))
        self.stdout.write(f"Published {published_count} scheduled sermon(s).")
