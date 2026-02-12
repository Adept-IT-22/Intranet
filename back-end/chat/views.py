from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from .models import ChatMessage, Conversation, ConversationParticipant
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
            "content": msg.message,  # Frontend expects 'content'
            "message": msg.message,  # Also include 'message' for compatibility
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
def send_message_http(request, username):
    """Send message via HTTP POST (more reliable than WebSocket)"""
    other_user = get_object_or_404(User, username=username)
    message_content = request.data.get("message")
    
    if not message_content:
        return Response({"error": "Message content required"}, status=400)
    
    # Create message
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
        "success": True
    }, status=201)

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

# ========== GROUP CHAT ENDPOINTS ==========

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """List all conversations (direct and group) for the current user"""
    user_conversations = ConversationParticipant.objects.filter(user=request.user).select_related('conversation', 'conversation__created_by')
    
    conversations_data = []
    for participant in user_conversations:
        conv = participant.conversation
        # Get last message
        last_message = conv.messages.order_by('-timestamp').first()
        # Get unread count
        unread_count = conv.messages.exclude(sender=request.user).filter(
            timestamp__gt=participant.last_read_at if participant.last_read_at else conv.created_at
        ).count()
        
        # Get other participants for display
        other_participants = conv.participants.exclude(user=request.user).select_related('user')
        participant_names = [p.user.username for p in other_participants]
        
        # Get participant details
        participant_details = []
        for p in conv.participants.all().select_related('user'):
            participant_details.append({
                "id": str(p.user.id),
                "username": p.user.username,
                "role": p.role,
            })
        
        conversations_data.append({
            "id": str(conv.id),
            "name": conv.get_display_name(request.user),
            "type": conv.type,
            "participants": participant_names,
            "participant_details": participant_details,
            "participant_count": conv.participants.count(),
            "created_by": conv.created_by.username,
            "last_message": {
                "content": last_message.message[:50] if last_message else None,
                "sender": last_message.sender.username if last_message else None,
                "timestamp": last_message.timestamp.isoformat() if last_message else None,
            } if last_message else None,
            "unread_count": unread_count,
            "updated_at": conv.updated_at.isoformat(),
        })
    
    # Sort by updated_at descending
    conversations_data.sort(key=lambda x: x['updated_at'], reverse=True)
    
    return Response(conversations_data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_or_get_direct_chat(request):
    """Create or get existing direct conversation with another user"""
    other_user_id = request.data.get('user_id')
    
    if not other_user_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if other_user == request.user:
        return Response({"error": "Cannot create a conversation with yourself"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if a direct conversation already exists between these two users
    existing_conversations = Conversation.objects.filter(
        type='direct',
        participants__user=request.user
    ).filter(
        participants__user=other_user
    ).distinct()
    
    # Filter to only conversations with exactly 2 participants
    for conv in existing_conversations:
        if conv.participants.count() == 2:
            # Found existing direct conversation
            return Response({
                "id": str(conv.id),
                "name": conv.get_display_name(request.user),
                "type": conv.type,
                "participants": [p.user.username for p in conv.participants.all()],
                "message": "Existing conversation found"
            })
    
    # Create new direct conversation
    conversation = Conversation.objects.create(
        type='direct',
        created_by=request.user
    )
    
    # Add both users as participants
    ConversationParticipant.objects.create(
        conversation=conversation,
        user=request.user,
        role='member'
    )
    ConversationParticipant.objects.create(
        conversation=conversation,
        user=other_user,
        role='member'
    )
    
    return Response({
        "id": str(conversation.id),
        "name": conversation.get_display_name(request.user),
        "type": conversation.type,
        "participants": [p.user.username for p in conversation.participants.all()],
        "message": "Direct conversation created successfully"
    }, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_group_chat(request):
    """Create a new group chat"""
    name = request.data.get('name', '').strip()
    participant_ids = request.data.get('participant_ids', [])
    
    if not name:
        return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if not participant_ids or len(participant_ids) < 1:
        return Response({"error": "At least one participant is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create conversation
    conversation = Conversation.objects.create(
        name=name,
        type='group',
        created_by=request.user
    )
    
    # Add creator as admin
    ConversationParticipant.objects.create(
        conversation=conversation,
        user=request.user,
        role='admin'
    )
    
    # Add other participants
    for user_id in participant_ids:
        try:
            user = User.objects.get(id=user_id)
            if user != request.user:
                ConversationParticipant.objects.create(
                    conversation=conversation,
                    user=user,
                    role='member'
                )
        except User.DoesNotExist:
            continue
    
    return Response({
        "id": str(conversation.id),
        "name": conversation.name,
        "type": conversation.type,
        "participants": [p.user.username for p in conversation.participants.all()],
        "message": "Group chat created successfully"
    }, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    """Get conversation details"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    conv = participant.conversation
    participants_data = []
    for p in conv.participants.all().select_related('user'):
        participants_data.append({
            "id": str(p.user.id),
            "username": p.user.username,
            "role": p.role,
            "joined_at": p.joined_at.isoformat(),
        })
    
    return Response({
        "id": str(conv.id),
        "name": conv.get_display_name(request.user),
        "type": conv.type,
        "participants": participants_data,
        "created_by": conv.created_by.username,
        "created_at": conv.created_at.isoformat(),
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """Get messages for a conversation"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    conv = participant.conversation
    messages = conv.messages.all().order_by('timestamp').select_related('sender')
    
    messages_data = []
    for msg in messages:
        message_data = {
            "id": str(msg.id),
            "sender": msg.sender.username,
            "content": msg.message,
            "timestamp": msg.timestamp.isoformat(),
            "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
            "is_read": msg.is_read,
            "is_me": msg.sender == request.user,
            "is_deleted": msg.is_deleted,
        }
        
        if msg.attachment:
            # Get full URL for the attachment
            from django.conf import settings
            request_scheme = request.scheme
            request_host = request.get_host()
            attachment_url = f"{request_scheme}://{request_host}{msg.attachment.url}"
            message_data["attachment"] = {
                "url": attachment_url,
                "name": msg.attachment_name,
                "size": msg.attachment_size,
            }
        
        messages_data.append(message_data)
    
    # Mark messages as read
    conv.messages.exclude(sender=request.user).update(is_read=True)
    participant.last_read_at = conv.messages.order_by('-timestamp').first().timestamp if conv.messages.exists() else None
    participant.save()
    
    return Response(messages_data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_participants(request, conversation_id):
    """Add participants to a group chat (admin only)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    if participant.role != 'admin':
        return Response({"error": "Only admins can add participants"}, status=status.HTTP_403_FORBIDDEN)
    
    if participant.conversation.type != 'group':
        return Response({"error": "Can only add participants to group chats"}, status=status.HTTP_400_BAD_REQUEST)
    
    user_ids = request.data.get('user_ids', [])
    added_users = []
    
    for user_id in user_ids:
        try:
            user = User.objects.get(id=user_id)
            if not ConversationParticipant.objects.filter(conversation=participant.conversation, user=user).exists():
                ConversationParticipant.objects.create(
                    conversation=participant.conversation,
                    user=user,
                    role='member'
                )
                added_users.append(user.username)
        except User.DoesNotExist:
            continue
    
    return Response({
        "message": f"Added {len(added_users)} participants",
        "added_users": added_users
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_conversation_message(request, conversation_id):
    """Send a message to a conversation (with optional file attachment)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    conv = participant.conversation
    message_content = request.data.get("message", "").strip()
    attachment_file = request.FILES.get("attachment")
    
    # Must have either message content or attachment
    if not message_content and not attachment_file:
        return Response({"error": "Message content or attachment is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create the message
    msg = ChatMessage.objects.create(
        conversation=conv,
        sender=request.user,
        message=message_content or "",
    )
    
    # Handle file attachment
    if attachment_file:
        msg.attachment = attachment_file
        msg.attachment_name = attachment_file.name
        msg.attachment_size = attachment_file.size
        msg.save()
    
    # Update conversation timestamp
    from django.utils import timezone
    conv.updated_at = timezone.now()
    conv.save(update_fields=['updated_at'])
    
    response_data = {
        "id": str(msg.id),
        "sender": msg.sender.username,
        "content": msg.message,
        "timestamp": msg.timestamp.isoformat(),
        "is_read": msg.is_read,
        "is_me": True,
    }
    
    if msg.attachment:
        # Get full URL for the attachment
        from django.conf import settings
        request_scheme = request.scheme
        request_host = request.get_host()
        attachment_url = f"{request_scheme}://{request_host}{msg.attachment.url}"
        response_data["attachment"] = {
            "url": attachment_url,
            "name": msg.attachment_name,
            "size": msg.attachment_size,
        }
    
    # Broadcast message via WebSocket to all participants (including attachment info)
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            attachment_data = None
            if msg.attachment:
                # Get relative URL for attachment
                attachment_url = msg.attachment.url
                # Ensure it starts with /media/
                if not attachment_url.startswith('/'):
                    attachment_url = f"/{attachment_url}"
                attachment_data = {
                    "url": attachment_url,
                    "name": msg.attachment_name,
                    "size": msg.attachment_size,
                }
            
            async_to_sync(channel_layer.group_send)(
                f'conversation_{conversation_id}',
                {
                    'type': 'chat_message',
                    'message': msg.message,
                    'sender': msg.sender.username,
                    'message_id': str(msg.id),
                    'attachment': attachment_data,
                }
            )
    except Exception as e:
        print(f"WebSocket broadcast failed (non-critical): {e}")
    
    return Response(response_data, status=status.HTTP_201_CREATED)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def edit_message(request, conversation_id, message_id):
    """Edit a message (only by sender)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    try:
        msg = ChatMessage.objects.get(id=message_id, conversation_id=conversation_id)
    except ChatMessage.DoesNotExist:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Only sender can edit
    if msg.sender != request.user:
        return Response({"error": "You can only edit your own messages"}, status=status.HTTP_403_FORBIDDEN)
    
    # Can't edit deleted messages
    if msg.is_deleted:
        return Response({"error": "Cannot edit deleted message"}, status=status.HTTP_400_BAD_REQUEST)
    
    new_content = request.data.get("message")
    if not new_content:
        return Response({"error": "Message content required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update message
    from django.utils import timezone
    msg.message = new_content
    msg.edited_at = timezone.now()
    msg.save()
    
    # Update conversation timestamp
    msg.conversation.updated_at = timezone.now()
    msg.conversation.save(update_fields=['updated_at'])
    
    # Broadcast edit via WebSocket (if channels is available)
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'conversation_{conversation_id}',
                {
                    'type': 'message_edited',
                    'message_id': str(msg.id),
                    'content': msg.message,
                    'edited_at': msg.edited_at.isoformat(),
                }
            )
    except Exception as e:
        print(f"WebSocket broadcast failed (non-critical): {e}")
    
    return Response({
        "id": str(msg.id),
        "sender": msg.sender.username,
        "content": msg.message,
        "timestamp": msg.timestamp.isoformat(),
        "edited_at": msg.edited_at.isoformat(),
        "is_read": msg.is_read,
        "is_me": True,
    })

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, conversation_id, message_id):
    """Delete a message (only by sender)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    try:
        msg = ChatMessage.objects.get(id=message_id, conversation_id=conversation_id)
    except ChatMessage.DoesNotExist:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Only sender can delete
    if msg.sender != request.user:
        return Response({"error": "You can only delete your own messages"}, status=status.HTTP_403_FORBIDDEN)
    
    # Soft delete
    from django.utils import timezone
    msg.is_deleted = True
    msg.deleted_at = timezone.now()
    msg.message = "[Message deleted]"
    msg.save()
    
    # Update conversation timestamp
    msg.conversation.updated_at = timezone.now()
    msg.conversation.save(update_fields=['updated_at'])
    
    # Broadcast delete via WebSocket (if channels is available)
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'conversation_{conversation_id}',
                {
                    'type': 'message_deleted',
                    'message_id': str(msg.id),
                }
            )
    except Exception as e:
        print(f"WebSocket broadcast failed (non-critical): {e}")
    
    return Response({
        "id": str(msg.id),
        "message": "Message deleted successfully"
    })

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_conversation_name(request, conversation_id):
    """Update conversation name (admin only)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    if participant.conversation.type != 'group':
        return Response({"error": "Can only rename group chats"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Only admin/creator can rename
    if participant.role != 'admin' and participant.conversation.created_by != request.user:
        return Response({"error": "Only admins can rename the group"}, status=status.HTTP_403_FORBIDDEN)
    
    new_name = request.data.get("name", "").strip()
    if not new_name:
        return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_name) > 255:
        return Response({"error": "Group name is too long (max 255 characters)"}, status=status.HTTP_400_BAD_REQUEST)
    
    participant.conversation.name = new_name
    participant.conversation.save()
    
    return Response({
        "id": str(participant.conversation.id),
        "name": participant.conversation.name,
        "type": participant.conversation.type,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_participant(request, conversation_id):
    """Remove a participant from a group chat (admin only)"""
    participant = get_object_or_404(
        ConversationParticipant,
        conversation_id=conversation_id,
        user=request.user
    )
    
    if participant.role != 'admin':
        return Response({"error": "Only admins can remove participants"}, status=status.HTTP_403_FORBIDDEN)
    
    if participant.conversation.type != 'group':
        return Response({"error": "Can only remove participants from group chats"}, status=status.HTTP_400_BAD_REQUEST)
    
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_to_remove = User.objects.get(id=user_id)
        # Don't allow removing the admin/creator
        if user_to_remove == participant.conversation.created_by:
            return Response({"error": "Cannot remove the group creator"}, status=status.HTTP_400_BAD_REQUEST)
        
        participant_to_remove = ConversationParticipant.objects.filter(
            conversation=participant.conversation,
            user=user_to_remove
        ).first()
        
        if participant_to_remove:
            participant_to_remove.delete()
            return Response({
                "message": f"Removed {user_to_remove.username} from the group"
            })
        else:
            return Response({"error": "User is not a participant"}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)