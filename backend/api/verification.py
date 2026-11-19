from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    key_salt = "api.EmailVerificationTokenGenerator"

    def _make_hash_value(self, user, timestamp):
        return f"{super()._make_hash_value(user, timestamp)}{user.email_verified_at}"


email_verification_token_generator = EmailVerificationTokenGenerator()


def send_email_verification(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token_generator.make_token(user)
    link = (
        f"{settings.FRONTEND_URL}/?email_verify_uid={uid}"
        f"&email_verify_token={token}"
    )
    return send_mail(
        "Verify your Gospread email address",
        (
            f"Hello {user.get_full_name() or user.username},\n\n"
            "Confirm that you control this email address by opening the link below "
            "and choosing Confirm email. The link expires after three days.\n\n"
            f"{link}\n\n"
            "If you did not create a Gospread account, you can ignore this message."
        ),
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
