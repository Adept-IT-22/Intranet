# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from .models import ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Room name based on two usernames
        self.usernames = self.scope['url_route']['kwargs']['room_name'].split('_')
        self.room_name = '_'.join(sorted(self.usernames))
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ WebSocket connected to {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"❌ WebSocket disconnected from {self.room_group_name}")

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_username = data['sender']
        receiver_username = data['receiver']
        message = data['message']

        sender = await database_sync_to_async(User.objects.get)(username=sender_username)
        receiver = await database_sync_to_async(User.objects.get)(username=receiver_username)

        # Save message to DB
        chat_message = await database_sync_to_async(ChatMessage.objects.create)(
            sender=sender,
            receiver=receiver,
            message=message
        )

        payload = {
            'sender': sender.username,
            'receiver': receiver.username,
            'message': message,
        }

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': json.dumps(payload)
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=message)
