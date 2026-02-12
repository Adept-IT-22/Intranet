from django.db import models
from django.conf import settings
from django.utils import timezone

class Announcement(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.CharField(max_length=500, blank=True, null=True)  # Short summary for preview
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional event date - if set, will appear on calendar
    event_date = models.DateTimeField(null=True, blank=True)
    event_end_date = models.DateTimeField(null=True, blank=True)
    
    # Priority/importance
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    # Whether announcement is active/published
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at.strftime('%Y-%m-%d')}"
