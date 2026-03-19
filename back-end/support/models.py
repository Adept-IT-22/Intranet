from django.db import models
from django.conf import settings

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('Hardware', 'Hardware'),
            ('Software', 'Software'),
            ('Network', 'Network'),
            ('Access Issues', 'Access Issues'),
            ('Other', 'Other'),
        ]
    )
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
