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

# Import routing AFTER Django setup
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
