import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope['url_route']['kwargs']['username']  # the other user
        self.user = self.scope["user"]
        self.room_name = f"chat_{min(self.user.username, self.username)}_{max(self.user.username, self.username)}"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Mark all messages from the other user as read when connecting
        await self.mark_messages_as_read()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        receiver_username = data['receiver']

        receiver = await self.get_user(receiver_username)

        # Save message in DB
        chat_msg = ChatMessage.objects.create(
            sender=self.user,
            receiver=receiver,
            message=message,
            is_read=False
        )

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
                'receiver': receiver.username,
                'timestamp': str(chat_msg.timestamp),
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # Mark messages as read
    async def mark_messages_as_read(self):
        from asgiref.sync import sync_to_async

        @sync_to_async
        def mark_read():
            other_user = User.objects.get(username=self.username)
            ChatMessage.objects.filter(sender=other_user, receiver=self.user, is_read=False).update(is_read=True)

        await mark_read()

    @sync_to_async
    def get_user(self, username):
        return User.objects.get(username=username)
