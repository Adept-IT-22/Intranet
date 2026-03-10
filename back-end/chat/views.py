from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatMessage, Conversation
from .serializers import UserSerializer, ChatMessageSerializer
import uuid
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_users(request):
    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_total_count(request):
    count = ChatMessage.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    return Response({"unread_count": count})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    conversations = request.user.conversations.all().order_by("-updated_at")
    data = []
    for conv in conversations:
        last_msg = conv.messages.all().order_by("-timestamp").first()
        other_user = None
        if not conv.is_group:
            other_user = conv.participants.exclude(id=request.user.id).first()
        
        # Helper to decide what show in the sidebar preview
        last_message_preview = "No messages yet"
        if last_msg:
            if last_msg.content:
                last_message_preview = last_msg.content
            elif last_msg.attachment:
                last_message_preview = f"📎 Sent an attachment"

        data.append({
            "id": str(conv.id),
            "name": conv.name or (other_user.username if other_user else "Unknown"),
            "is_group": conv.is_group,
            "last_message": last_message_preview,
            "timestamp": last_msg.timestamp if last_msg else conv.updated_at,
            "unread_count": conv.messages.filter(is_read=False).exclude(sender=request.user).count()
        })
    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_direct_conversation(request):
    user_id = request.data.get("user_id")
    other_user = get_object_or_404(User, id=user_id)
    
    # Check if a direct conversation already exists
    conv = Conversation.objects.filter(is_group=False, participants=request.user).filter(participants=other_user).first()
    
    if not conv:
        conv = Conversation.objects.create(is_group=False)
        conv.participants.add(request.user, other_user)
    
    return Response({"id": str(conv.id), "name": other_user.username, "is_group": False})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_group_conversation(request):
    name = request.data.get("name")
    participant_ids = request.data.get("participant_ids", [])
    
    conv = Conversation.objects.create(name=name, is_group=True)
    conv.participants.add(request.user)
    for p_id in participant_ids:
        conv.participants.add(p_id)
        
    return Response({"id": str(conv.id), "name": conv.name, "is_group": True})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_history(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id)
    messages = conv.messages.all().order_by("timestamp")
    
    return Response([
        {
            "id": msg.id,
            "sender": msg.sender.username,
            "content": msg.content,
            "timestamp": msg.timestamp,
            "is_read": msg.is_read,
            "is_me": msg.sender == request.user,
            "attachment": {
                "name": msg.attachment.name.split("/")[-1] if msg.attachment else None,
                "url": msg.attachment.url if msg.attachment else None,
                "size": msg.attachment.size if msg.attachment else 0
            } if msg.attachment else None
        }
        for msg in messages
    ])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_details(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id)
    return Response({
        "id": str(conv.id),
        "name": conv.name or conv.participants.exclude(id=request.user.id).first().username,
        "is_group": conv.is_group,
        "participants": [
            {
                "id": p.id,
                "username": p.username,
                "role": "admin" if p == request.user else "member" # Simplified
            } for p in conv.participants.all()
        ],
        "created_at": conv.created_at
    })

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def edit_chat_message(request, conversation_id, message_id):
    msg = get_object_or_404(ChatMessage, id=message_id, conversation_id=conversation_id, sender=request.user)
    content = request.data.get("message")
    if content:
        msg.content = content
        msg.save()
    return Response({"id": msg.id, "content": msg.content})

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_chat_message(request, conversation_id, message_id):
    msg = get_object_or_404(ChatMessage, id=message_id, conversation_id=conversation_id, sender=request.user)
    msg.delete()
    return Response({"message": "Deleted"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_message_to_conversation(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id)
    content = request.data.get("message", "")
    attachment = request.FILES.get("attachment")
    
    msg = ChatMessage.objects.create(
        conversation=conv,
        sender=request.user,
        content=content,
        attachment=attachment
    )
    conv.save() # Update updated_at
    
    # Broadcast to websocket
    channel_layer = get_channel_layer()
    
    # 1. Broadcast to the specific conversation group
    async_to_sync(channel_layer.group_send)(
        f'chat_{conversation_id}',
        {
            'type': 'chat_message_broadcast',
            'message': msg.content,
            'sender': msg.sender.username,
        }
    )
    
    # 2. Broadcast notification to ALL participants (for sidebar/desktop notifications)
    for participant in conv.participants.all():
        # For non-group chats, the "conversation name" for any participant is the OTHER person's name.
        # It's easier for the backend to send the sender's info and let the frontend handle naming
        # or send a tailored name for each participant.
        
        target_name = conv.name # Use group name if it exists
        if not conv.is_group:
            # For the participant, the conversation name is the name of the OTHER person
            other = conv.participants.exclude(id=participant.id).first()
            target_name = other.username if other else "Unknown"

        async_to_sync(channel_layer.group_send)(
            f'user_{participant.id}',
            {
                'type': 'notify_new_message',
                'message': msg.content or "Sent an attachment",
                'sender': msg.sender.username,
                'conversation_id': str(conv.id),
                'conversation_name': target_name,
                'is_group': conv.is_group,
                'timestamp': str(msg.timestamp)
            }
        )
    
    return Response({
        "id": msg.id,
        "sender": msg.sender.username,
        "content": msg.content,
        "timestamp": msg.timestamp,
        "attachment": {
            "name": msg.attachment.name.split("/")[-1] if msg.attachment else None,
            "url": msg.attachment.url if msg.attachment else None,
            "size": msg.attachment.size if msg.attachment else 0
        } if msg.attachment else None
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_conversation_as_read(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id)
    if request.user not in conv.participants.all():
        return Response({"error": "Unauthorized"}, status=403)
    
    conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    
    # Notify user's other tabs/dashboard that unread count has changed
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{request.user.id}',
        {
            'type': 'notify_messages_read',
            'conversation_id': str(conv.id),
        }
    )
    
    return Response({"message": "Conversation marked as read"})

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_group_name(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id, is_group=True)
    if request.user not in conv.participants.all():
        return Response({"error": "Unauthorized"}, status=403)
    
    name = request.data.get("name")
    if name:
        conv.name = name
        conv.save()
        return Response({"id": str(conv.id), "name": conv.name})
    return Response({"error": "Name is required"}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def manage_group_participants(request, conversation_id):
    conv = get_object_or_404(Conversation, id=conversation_id, is_group=True)
    if request.user not in conv.participants.all():
        return Response({"error": "Unauthorized"}, status=403)
    
    action = request.data.get("action") # "add" or "remove"
    user_id = request.data.get("user_id")
    target_user = get_object_or_404(User, id=user_id)
    
    if action == "add":
        conv.participants.add(target_user)
    elif action == "remove":
        if conv.participants.count() <= 1:
            return Response({"error": "Cannot remove the last participant"}, status=400)
        conv.participants.remove(target_user)
    else:
        return Response({"error": "Invalid action"}, status=400)
        
    return Response({"message": f"User {action}ed successfully"})
