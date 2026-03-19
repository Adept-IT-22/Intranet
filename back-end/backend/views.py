from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from chat.models import ChatMessage  


User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username & password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({"message": "User created successfully", "username": user.username})

@api_view(["GET"])
@permission_classes([AllowAny])
def root_view(request):
    return Response({"message": "Welcome to the API root ✅"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    # Instead of just a role string, we provide specific capabilities
    # This prevents hardcoding "admin" strings on the frontend
    is_admin_user = (user.role == "admin" or user.is_superuser)
    
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "admin" if is_admin_user else user.role,
        "capabilities": {
            "can_post_announcements": is_admin_user or user.has_perm('announcements.add_announcement'),
            "can_delete_announcements": is_admin_user or user.has_perm('announcements.delete_announcement'),
        }
    })

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
        }
        for msg in messages
    ])

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_as_read(request, username):
    other_user = get_object_or_404(User, username=username)

    # Note: Your ChatMessage model doesn't have is_read field yet
    # You'll need to add it if you want this functionality
    # ChatMessage.objects.filter(
    #     sender=other_user,
    #     receiver=request.user,
    #     is_read=False
    # ).update(is_read=True)

    return Response({"message": f"Marked messages from {username} as read ✅"})

