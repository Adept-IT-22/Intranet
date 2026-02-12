from rest_framework import serializers
from .models import Announcement
from django.contrib.auth import get_user_model

User = get_user_model()

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'summary', 
            'created_by', 'created_by_username', 'created_by_name',
            'created_at', 'updated_at', 'event_date', 'event_end_date',
            'priority', 'is_active'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by.first_name or obj.created_by.last_name:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return obj.created_by.username

