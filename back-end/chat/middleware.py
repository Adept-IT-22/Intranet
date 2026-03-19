import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs

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
        token = query_string.get("token")
        user = None

        if token:
            try:
                payload = jwt.decode(token[0], settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("user_id")
                user = await get_user(user_id)
            except jwt.ExpiredSignatureError:
                print("JWT expired")
            except jwt.InvalidTokenError:
                print("JWT invalid")

        scope["user"] = user or AnonymousUser()
        return await super().__call__(scope, receive, send)
