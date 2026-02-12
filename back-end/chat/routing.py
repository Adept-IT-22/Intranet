from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Support both username (direct chat) and UUID (group chat)
    re_path(r"ws/chat/(?P<username>[^/]+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/conversation/(?P<conversation_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$", consumers.ChatConsumer.as_asgi()),
]
