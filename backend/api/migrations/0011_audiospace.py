from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0010_communitypost_communitycomment"),
    ]

    operations = [
        migrations.CreateModel(
            name="AudioSpace",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("room_name", models.CharField(max_length=180, unique=True)),
                ("title", models.CharField(max_length=220)),
                ("topic", models.CharField(blank=True, max_length=280)),
                ("ministry_name", models.CharField(blank=True, max_length=180)),
                ("started_at", models.DateTimeField(auto_now_add=True)),
                ("ended_at", models.DateTimeField(blank=True, null=True)),
                ("is_live", models.BooleanField(default=True)),
                ("host", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="audio_spaces", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-started_at"]},
        ),
    ]
