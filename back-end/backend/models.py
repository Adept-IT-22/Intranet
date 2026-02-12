# backend/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
import os

def user_avatar_upload_path(instance, filename):
    """Generate upload path for user avatars"""
    ext = filename.split('.')[-1]
    return f'users/avatars/{instance.id}/avatar.{ext}'

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
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
    avatar = models.ImageField(upload_to=user_avatar_upload_path, null=True, blank=True)
    
    def get_initials(self):
        """Get user initials from username"""
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        elif self.first_name:
            return self.first_name[0].upper()
        elif self.username:
            # Use first two letters of username
            return self.username[:2].upper()
        return "U"
