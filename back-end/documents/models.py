from django.db import models
from django.conf import settings  # ✅ correct way


class Document(models.Model):
    CATEGORY_CHOICES = [
        ("HR", "HR Forms"),
        ("POLICY", "Policies & Procedures"),
        ("PROJECT", "Project Files"),
        ("TRAINING", "Training Materials"),
        ("ARCHIVE", "Archived Documents"),
    ]

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="documents/")
    
    # ✅ FIX: dynamically use the configured User model
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents"
    )
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
