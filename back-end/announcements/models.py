# announcements/models.py
from django.db import models

class Announcement(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    details = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title
