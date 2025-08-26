# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from .models import ChatMessage
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import close_old_connections

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # ✅ Extract token from query params
        self.token = self.scope['query_string'].decode().split('token=')[-1]
        self.user = await self.get_user_from_token(self.token)
        if not self.user:
            await self.close()
            return

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender = self.user
        receiver = await self.get_user_by_username(data['receiver'])

        if not receiver:
            return

        # Save message
        await self.save_message(sender, receiver, message)

        # Broadcast message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender.username,
                "receiver": receiver.username
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            close_old_connections()
            validated_token = UntypedToken(token)
            user = JWTAuthentication().get_user(validated_token)
            return user
        except Exception:
            return None

    @database_sync_to_async
    def get_user_by_username(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        return ChatMessage.objects.create(sender=sender, receiver=receiver, message=message)
