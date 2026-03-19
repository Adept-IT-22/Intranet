from rest_framework import serializers
from django.contrib.auth import get_user_model
from chat.models import ChatMessage  # ✅ Import ChatMessage instead

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.username")
    receiver = serializers.CharField(source="receiver.username")

    class Meta:
        model = ChatMessage  # ✅ Use ChatMessage model
        fields = ["id", "sender", "receiver", "message", "timestamp"]  # ✅ Use 'message' field