import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# Set settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Django ASGI application for HTTP
django_asgi_app = get_asgi_application()

# Import chat routing AFTER setup
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # ✅ Handle normal HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
