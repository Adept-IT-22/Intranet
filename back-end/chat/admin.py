from django.contrib import admin
from .models import ChatMessage, Conversation

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_group", "created_at")
    filter_horizontal = ("participants",)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "sender", "content", "timestamp")
    search_fields = ("content", "sender__username")
    list_filter = ("timestamp", "conversation")