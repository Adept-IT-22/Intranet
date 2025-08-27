from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatMessage
from .serializers import UserSerializer, ChatMessageSerializer

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_users(request):
    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request, username):
    other_user = get_object_or_404(User, username=username)

    # Fetch messages between current user & other_user
    messages = ChatMessage.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by("timestamp")

    return Response([
        {
            "id": msg.id,
            "sender": msg.sender.username,
            "receiver": msg.receiver.username,
            "content": msg.message,  # ✅ Use 'message' field from ChatMessage model
            "timestamp": msg.timestamp,
            "is_read": msg.is_read,
        }
        for msg in messages
    ])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, user_id):
    other_user = User.objects.get(id=user_id)
    messages = ChatMessage.objects.filter(
        sender__in=[request.user, other_user],
        receiver__in=[request.user, other_user]
    ).order_by("timestamp")
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, username):
    other_user = get_object_or_404(User, username=username)
    message_content = request.data.get("message")
    
    if not message_content:
        return Response({"error": "Message content required"}, status=400)
    
    chat_message = ChatMessage.objects.create(
        sender=request.user,
        receiver=other_user,
        message=message_content
    )
    
    return Response({
        "id": chat_message.id,
        "sender": chat_message.sender.username,
        "receiver": chat_message.receiver.username,
        "content": chat_message.message,
        "timestamp": chat_message.timestamp,
        "is_read": chat_message.is_read,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_messages_as_read(request, username):
    other_user = get_object_or_404(User, username=username)
    
    # Update messages to mark as read
    ChatMessage.objects.filter(
        sender=other_user,
        receiver=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({"message": f"Marked messages from {username} as read ✅"})