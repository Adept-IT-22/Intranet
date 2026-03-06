import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# ✅ Make sure settings are configured FIRST
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django.setup()  # initialize Django

# HTTP handling
django_asgi_app = get_asgi_application()

# Import routing and middleware AFTER Django setup
import chat.routing
from chat.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
