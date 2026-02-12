# chat/models.py
from django.db import models
from django.conf import settings
import uuid

# Conversation model for both direct and group chats
class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('direct', 'Direct Chat'),
        ('group', 'Group Chat'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, blank=True, null=True)  # For group chats
    type = models.CharField(max_length=20, choices=CONVERSATION_TYPES, default='direct')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_conversations', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.type == 'group' and self.name:
            return self.name
        return f"Conversation {self.id}"
    
    def get_display_name(self, user):
        """Get display name for a user in this conversation"""
        if self.type == 'group' and self.name:
            return self.name
        # For direct chats, return the other user's name
        other_participant = self.participants.exclude(user=user).first()
        if other_participant:
            return other_participant.user.username
        return "Unknown"

# Conversation participants
class ConversationParticipant(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, related_name='participants', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='conversation_participations', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['conversation', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.conversation}"

# Updated ChatMessage model to support both direct and group chats
def message_file_upload_path(instance, filename):
    """Generate upload path for message attachments"""
    return f'chat/messages/{instance.conversation.id if instance.conversation else "direct"}/{instance.id}/{filename}'

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE, null=True, blank=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE, null=True, blank=True)  # For backward compatibility
    message = models.TextField(blank=True)  # Allow empty for file-only messages
    attachment = models.FileField(upload_to=message_file_upload_path, null=True, blank=True)
    attachment_name = models.CharField(max_length=255, null=True, blank=True)
    attachment_size = models.IntegerField(null=True, blank=True)  # Size in bytes
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['conversation', 'timestamp']),
            models.Index(fields=['sender', 'timestamp']),
        ]
    
    def __str__(self):
        if self.conversation:
            return f"{self.sender} -> {self.conversation}: {self.message[:20]}"
        return f"{self.sender} -> {self.receiver}: {self.message[:20]}"
