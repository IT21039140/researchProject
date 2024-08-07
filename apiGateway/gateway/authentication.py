import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import UserEdu

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            print("Authorization header missing")
            return None

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Access token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        try:
            user = UserEdu.objects.get(id=payload['user_id'])
        except UserEdu.DoesNotExist:
            raise AuthenticationFailed('User not found')

        return (user, None)

    @staticmethod
    def generate_access_token(user):
        payload = {
            'user_id': str(user.id),
            'exp': datetime.utcnow() + settings.ACCESS_TOKEN_LIFETIME,
            'iat': datetime.utcnow(),
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def generate_refresh_token(user):
        payload = {
            'user_id': str(user.id),
            'exp': datetime.utcnow() + settings.REFRESH_TOKEN_LIFETIME,
            'iat': datetime.utcnow(),
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
