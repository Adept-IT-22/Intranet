from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Announcement
from .serializers import AnnouncementSerializer
from django.utils import timezone

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only show active announcements to regular users
        queryset = Announcement.objects.filter(is_active=True)
        
        # Super admins can see all announcements
        if self.request.user.role == 'super_admin':
            queryset = Announcement.objects.all()
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        # Only super_admin can create announcements
        if self.request.user.role != 'super_admin':
            raise PermissionDenied("Only super admins can create announcements")
        
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        # Only super_admin can update announcements
        if self.request.user.role != 'super_admin':
            raise PermissionDenied("Only super admins can update announcements")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only super_admin can delete announcements
        if self.request.user.role != 'super_admin':
            raise PermissionDenied("Only super admins can delete announcements")
        
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        """Get announcements that have event dates (for calendar)"""
        now = timezone.now()
        events = Announcement.objects.filter(
            is_active=True,
            event_date__isnull=False,
            event_date__gte=now
        ).order_by('event_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
