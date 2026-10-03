"""
Custom authentication backend that authenticates users by email address.

Django's default ModelBackend uses the USERNAME_FIELD for lookups, but
AbstractUser's authenticate() still passes the credential as 'username'
internally. Since our User model sets USERNAME_FIELD = "email", we need
this backend so that django.contrib.auth.authenticate() resolves email
→ user correctly for SimpleJWT's TokenObtainPairSerializer.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailBackend(ModelBackend):
    """Authenticate against the email field instead of username."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()

        # SimpleJWT passes the credential under the USERNAME_FIELD key ("email"),
        # but Django's authenticate() always forwards it as "username".
        # Accept both so this backend works regardless of call-site.
        email = username or kwargs.get("email")
        if not email or not password:
            return None

        try:
            user = UserModel.objects.get(email__iexact=email.strip())
        except UserModel.DoesNotExist:
            # Run the default password hasher to resist timing attacks
            UserModel().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
