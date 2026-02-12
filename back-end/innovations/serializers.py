from rest_framework import serializers
from .models import Innovation, InnovationVote
from django.contrib.auth import get_user_model

User = get_user_model()

class InnovationSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    has_upvoted = serializers.SerializerMethodField()
    
    class Meta:
        model = Innovation
        fields = [
            'id', 'title', 'description', 
            'created_by', 'created_by_username', 'created_by_name',
            'upvotes_count', 'created_at', 'updated_at', 'has_upvoted'
        ]
        read_only_fields = ['created_by', 'upvotes_count', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by.first_name or obj.created_by.last_name:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return obj.created_by.username
    
    def get_has_upvoted(self, obj):
        """Check if the current user has upvoted this innovation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return InnovationVote.objects.filter(
                innovation=obj,
                user=request.user
            ).exists()
        return False

