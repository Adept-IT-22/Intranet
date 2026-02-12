import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatMessage, Conversation, ConversationParticipant
import uuid

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Support both username (direct chat) and conversation_id (group chat)
        chat_target = self.scope['url_route']['kwargs'].get('username')
        conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        
        if conversation_id:
            # It's a group chat
            self.conversation_id = str(conversation_id)
            self.is_group_chat = True
            self.room_group_name = f'conversation_{self.conversation_id}'
            self.chat_username = None
        elif chat_target:
            # It's a direct chat
            self.chat_username = chat_target
            self.is_group_chat = False
            self.room_group_name = f'chat_{self.chat_username}'
            self.conversation_id = None
        else:
            await self.close()
            return

        # Verify user has access to this conversation
        has_access = await self.check_access()
        if not has_access:
            await self.close()
            return

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the group on disconnect
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def check_access(self):
        """Check if user has access to this conversation"""
        from django.contrib.auth.models import AnonymousUser
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser):
            return False
        
        if self.is_group_chat:
            # Check if user is a participant in the conversation
            try:
                conversation = Conversation.objects.get(id=self.conversation_id)
                return ConversationParticipant.objects.filter(
                    conversation=conversation,
                    user=user
                ).exists()
            except Conversation.DoesNotExist:
                return False
        else:
            # Direct chat - allow access
            return True

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')
        sender = data.get('sender')
        conversation_id = data.get('conversation_id')
        receiver = data.get('receiver')
        message = data.get('message')

        if msg_type == "chat_message":
            # Save the message in DB
            saved_message = await self.save_message(
                sender, 
                receiver, 
                message, 
                conversation_id
            )

            if saved_message:
                # Determine target room
                if conversation_id:
                    # Group chat - send to conversation room
                    target_room = f'conversation_{conversation_id}'
                else:
                    # Direct chat - send to receiver
                    target_room = f'chat_{receiver}'

                # Broadcast to all participants with message ID and attachment info
                attachment_data = None
                if saved_message.attachment:
                    # Get relative URL for attachment (frontend will construct full URL)
                    attachment_url = saved_message.attachment.url
                    # Ensure URL starts with /media/
                    if not attachment_url.startswith('/'):
                        attachment_url = f"/{attachment_url}"
                    attachment_data = {
                        'url': attachment_url,
                        'name': saved_message.attachment_name,
                        'size': saved_message.attachment_size,
                    }
                    print(f"📎 Broadcasting attachment: {attachment_url}")  # Debug log
                
                await self.channel_layer.group_send(
                    target_room,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender': sender,
                        'message_id': str(saved_message.id),
                        'temp_id': data.get('temp_id'),
                        'attachment': attachment_data,
                    }
                )
            else:
                # Log error if message wasn't saved
                print(f"Failed to save message from {sender} to conversation {conversation_id}")

        elif msg_type == "typing":
            # Determine target room
            if conversation_id:
                target_room = f'conversation_{conversation_id}'
            else:
                target_room = f'chat_{receiver}'
            
            # Notify participants that sender is typing
            await self.channel_layer.group_send(
                target_room,
                {
                    'type': 'typing',
                    'sender': sender,
                }
            )
        
        elif msg_type == "message_edited":
            # Broadcast message edit to all participants
            if conversation_id:
                target_room = f'conversation_{conversation_id}'
                await self.channel_layer.group_send(
                    target_room,
                    {
                        'type': 'message_edited',
                        'message_id': data.get('message_id'),
                        'content': data.get('content'),
                        'edited_at': data.get('edited_at'),
                    }
                )
        
        elif msg_type == "message_deleted":
            # Broadcast message delete to all participants
            if conversation_id:
                target_room = f'conversation_{conversation_id}'
                await self.channel_layer.group_send(
                    target_room,
                    {
                        'type': 'message_deleted',
                        'message_id': data.get('message_id'),
                    }
                )

    # --- Event Handlers for messages coming from group_send ---
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'message_id': event.get('message_id'),
            'temp_id': event.get('temp_id'),
            'attachment': event.get('attachment'),
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender': event['sender'],
        }))
    
    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'content': event['content'],
            'edited_at': event['edited_at'],
        }))
    
    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
        }))

    # --- DB helper ---
    @database_sync_to_async
    def save_message(self, sender_username, receiver_username, message, conversation_id=None):
        try:
            sender = User.objects.get(username=sender_username)
            
            if conversation_id:
                # Group chat - save to conversation
                try:
                    conversation = Conversation.objects.get(id=conversation_id)
                    # Verify sender is a participant
                    if not ConversationParticipant.objects.filter(
                        conversation=conversation, 
                        user=sender
                    ).exists():
                        return None
                    
                    msg = ChatMessage.objects.create(
                        conversation=conversation,
                        sender=sender,
                        message=message
                    )
                    # Update conversation's updated_at timestamp
                    from django.utils import timezone
                    conversation.updated_at = timezone.now()
                    conversation.save(update_fields=['updated_at'])
                    print(f"✅ Saved message {msg.id} to conversation {conversation_id}")
                    return msg
                except Conversation.DoesNotExist:
                    print(f"❌ Conversation {conversation_id} not found")
                    return None
                except Exception as e:
                    print(f"❌ Error saving message to conversation {conversation_id}: {e}")
                    return None
            else:
                # Direct chat - backward compatible
                receiver = User.objects.get(username=receiver_username)
                return ChatMessage.objects.create(
                    sender=sender,
                    receiver=receiver,
                    message=message
                )
        except User.DoesNotExist:
            return None
