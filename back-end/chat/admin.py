from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "message", "timestamp")
    search_fields = ("message", "sender__username", "receiver__username")
    list_filter = ("timestamp",)