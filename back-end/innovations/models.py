from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator

class Innovation(models.Model):
    title = models.CharField(max_length=255, validators=[MinLengthValidator(3)])
    description = models.TextField(validators=[MinLengthValidator(10)])
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='innovations'
    )
    upvotes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-upvotes_count', '-created_at']  # Highest upvotes first, then newest
    
    def __str__(self):
        return f"{self.title} ({self.upvotes_count} upvotes)"

class InnovationVote(models.Model):
    """Track who voted for which innovation (prevent duplicate votes)"""
    innovation = models.ForeignKey(
        Innovation,
        on_delete=models.CASCADE,
        related_name='votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='innovation_votes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['innovation', 'user']  # One vote per user per innovation
    
    def __str__(self):
        return f"{self.user.username} upvoted {self.innovation.title}"
