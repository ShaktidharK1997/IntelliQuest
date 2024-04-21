from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Use email to authenticate
        email = username
        if email is None:
            email = kwargs.get('email')
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

def get_tokens_for_user(user):
    """
    Generate JWT tokens for a given user.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication class that uses JWT tokens for authentication.
    """
    def authenticate(self, request):
        """
        Attempts to authenticate the request using JWT.
        """
        header = api_settings.AUTH_HEADER_TYPES[0]
        token = request.COOKIES.get('jwt') or request.headers.get('Authorization')
        if token is None or not token.startswith(header):
            return None
        token = token.split(header)[1].strip()
        return self.validate_jwt(token)

    @staticmethod
    def validate_jwt(token):
        """
        Validates the JWT token. Decode the token, check for expiration, etc.
        """
        try:
            decoded_token = RefreshToken(token)
            user = User.objects.get(id=decoded_token['user_id'])
            return (user, None)
        except TokenError as e:
            raise exceptions.AuthenticationFailed('Invalid token or expired token')
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('No user matching this token was found')

# Example usage in settings.py
# AUTHENTICATION_BACKENDS = ['IntelliQuest_v1.authentication.EmailBackend']
