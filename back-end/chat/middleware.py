import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]
        user = None

        if token:
            try:
                # Validate token using SimpleJWT
                UntypedToken(token)
                # Decode to get user_id
                decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get("user_id") or decoded_data.get("sub")
                if user_id:
                    user = await get_user(user_id)
            except (TokenError, InvalidToken, jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
                print(f"JWT authentication failed: {e}")

        scope["user"] = user if user else AnonymousUser()
        return await super().__call__(scope, receive, send)
