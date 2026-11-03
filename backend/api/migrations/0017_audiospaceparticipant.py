from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0016_sermonshort_crop"),
    ]

    operations = [
        migrations.CreateModel(
            name="AudioSpaceParticipant",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("identity", models.CharField(max_length=180)),
                ("display_name", models.CharField(blank=True, max_length=180)),
                ("role", models.CharField(choices=[("speaker", "Speaker"), ("cohost", "Co-host")], max_length=16)),
                (
                    "audio_space",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participants",
                        to="api.audiospace",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="audiospaceparticipant",
            constraint=models.UniqueConstraint(
                fields=("audio_space", "identity"),
                name="unique_audio_space_participant_identity",
            ),
        ),
    ]
