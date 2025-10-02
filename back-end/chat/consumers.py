import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # The "username" is passed in the URL via routing.py
        self.chat_username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f'chat_{self.chat_username}'

        # Join the user-specific group
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

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')
        sender = data.get('sender')
        receiver = data.get('receiver')

        if msg_type == "chat_message":
            message = data.get('message')

            # Save the message in DB
            await self.save_message(sender, receiver, message)

            # Send to both sender and receiver groups
            # The frontend will handle deduplication for the sender
            await self.channel_layer.group_send(
                f'chat_{receiver}',
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender,
                }
            )
            
            await self.channel_layer.group_send(
                f'chat_{sender}',
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender,
                }
            )

        elif msg_type == "typing":
            # Notify the receiver that the sender is typing
            await self.channel_layer.group_send(
                f'chat_{receiver}',
                {
                    'type': 'typing',
                    'sender': sender,
                }
            )

    # --- Event Handlers for messages coming from group_send ---
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender': event['sender'],
        }))

    # --- DB helper ---
    @database_sync_to_async
    def save_message(self, sender_username, receiver_username, message):
        sender = User.objects.get(username=sender_username)
        receiver = User.objects.get(username=receiver_username)
        return ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=message  # ✅ use correct field
        )
