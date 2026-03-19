from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async

class JWTAuthMiddleware:
    """
    Custom JWT middleware for WebSocket authentication.
    Loads JWT libraries lazily to avoid circular imports.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # ✅ Lazy import ONLY when needed (avoids circular imports)
        from django.conf import settings
        from django.contrib.auth import get_user_model
        import jwt
        from rest_framework_simplejwt.tokens import UntypedToken

        # Default user is Anonymous
        scope['user'] = AnonymousUser()

        # Get token from query string (ws://...?token=abc)
        token = None
        query_string = scope.get("query_string", b"").decode()
        if query_string:
            params = parse_qs(query_string)
            token = params.get("token", [None])[0]

        # Get token from headers (Authorization: Bearer ...)
        if not token and "headers" in scope:
            for header_name, header_value in scope["headers"]:
                if header_name == b"authorization":
                    auth_header = header_value.decode()
                    if auth_header.startswith("Bearer "):
                        token = auth_header.split("Bearer ")[1]

        # ✅ Validate token and attach user
        if token:
            try:
                # Decode JWT payload
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

                # Validate token via SimpleJWT
                UntypedToken(token)

                # Fetch the user
                user_id = decoded.get("user_id")
                if user_id:
                    User = get_user_model()
                    user = await sync_to_async(User.objects.get)(id=user_id)
                    scope["user"] = user

            except Exception as e:
                print(f"JWTAuthMiddleware: Invalid token → {e}")

        # Continue with the inner ASGI app
        return await self.inner(scope, receive, send)
