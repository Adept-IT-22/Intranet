# chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatMessage

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_users(request):
    users = User.objects.exclude(id=request.user.id)
    return Response([{"id": u.id, "username": u.username, "email": u.email} for u in users])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request, username):
    other_user = get_object_or_404(User, username=username)
    messages = ChatMessage.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by("timestamp")

    return Response([
        {
            "id": msg.id,
            "sender": msg.sender.username,
            "receiver": msg.receiver.username,
            "content": msg.message,
            "timestamp": msg.timestamp,
        } for msg in messages
    ])
