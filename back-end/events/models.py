from django.db import models


class CalendarEvent(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()

    # Recurrence options: none, daily, weekly, monthly
    recurrence = models.CharField(
        max_length=20,
        choices=[
            ("", "No recurrence"),
            ("daily", "Daily"),
            ("weekly", "Weekly"),
            ("monthly", "Monthly"),
        ],
        blank=True,
        default="",
    )

    # Store comma-separated emails
    attendees = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.start} → {self.end})"


