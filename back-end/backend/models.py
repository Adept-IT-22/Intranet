# backend/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

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
