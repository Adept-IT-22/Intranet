# backend/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image
import io
from django.core.files.base import ContentFile

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('manager', 'Manager'),
    )

    DEPARTMENT_CHOICES = (
        ('hr', 'Human Resources'),
        ('it', 'IT'),
        ('finance', 'Finance'),
        ('marketing', 'Marketing'),
    )

    TEAM_CHOICES = (
        ('kitro', 'Kitro Team (AI/ML)'),
        ('devops', 'DevOps'),
        ('support', 'IT Support'),
    )

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, null=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    team = models.CharField(max_length=50, choices=TEAM_CHOICES, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def save(self, *args, **kwargs):
        # Image compression / resizing
        if self.avatar:
            try:
                img = Image.open(self.avatar)
                if img.height > 300 or img.width > 300:
                    output_size = (300, 300)
                    img.thumbnail(output_size)
                    
                    # Convert to RGB if needed (for JPEG)
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                        
                    output = io.BytesIO()
                    img.save(output, format='JPEG', quality=80)
                    output.seek(0)
                    self.avatar = ContentFile(output.read(), name=self.avatar.name)
            except Exception as e:
                print(f"Error compressing image: {e}")
                
        super().save(*args, **kwargs)
