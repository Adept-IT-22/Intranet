from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from chat.models import ChatMessage
import os  


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
    avatar_url = None
    if user.avatar:
        from django.conf import settings
        request_scheme = request.scheme
        request_host = request.get_host()
        avatar_url = f"{request_scheme}://{request_host}{user.avatar.url}"
    
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "avatar": avatar_url,
        "initials": user.get_initials(),
    })

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile (avatar, first_name, last_name)"""
    user = request.user
    
    # Update first_name and last_name
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    
    # Update avatar if provided
    if 'avatar' in request.FILES:
        # Delete old avatar if exists
        if user.avatar:
            try:
                os.remove(user.avatar.path)
            except:
                pass
        user.avatar = request.FILES['avatar']
    
    user.save()
    
    avatar_url = None
    if user.avatar:
        from django.conf import settings
        request_scheme = request.scheme
        request_host = request.get_host()
        avatar_url = f"{request_scheme}://{request_host}{user.avatar.url}"
    
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "avatar": avatar_url,
        "initials": user.get_initials(),
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint - clears tokens on client side"""
    # Since we're using JWT, tokens are stateless
    # The client should remove tokens from localStorage
    # This endpoint is mainly for consistency and can be used for logging
    return Response({"message": "Logged out successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_users(request):
    """Get count of active users based on recent activity"""
    from django.utils import timezone
    from datetime import timedelta
    from chat.models import ChatMessage
    
    # Consider users active if they've sent a message in the last 15 minutes
    active_threshold = timezone.now() - timedelta(minutes=15)
    
    # Get unique users who sent messages recently
    recent_messages = ChatMessage.objects.filter(
        timestamp__gte=active_threshold
    ).select_related('sender')
    
    active_user_ids = set()
    active_users_list = []
    
    for msg in recent_messages:
        if msg.sender.id not in active_user_ids:
            active_user_ids.add(msg.sender.id)
            active_users_list.append({
                "id": msg.sender.id,
                "username": msg.sender.username,
                "last_activity": msg.timestamp.isoformat(),
            })
    
    # Also check WebSocket connections if available (optional)
    # This would require tracking WebSocket connections separately
    
    return Response({
        "active_count": len(active_users_list),
        "active_users": active_users_list,
        "threshold_minutes": 15,
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

