from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Ticket

@receiver(post_save, sender=Ticket)
def send_ticket_notifications(sender, instance, created, **kwargs):
    if created:
        # --- Email to IT team ---
        send_mail(
            subject=f"[IT Support] New Ticket: {instance.title}",
            message=f"A new support ticket has been submitted.\n\n"
                    f"Title: {instance.title}\n"
                    f"Category: {instance.category}\n"
                    f"Description: {instance.description}\n\n"
                    f"Submitted by: {instance.name} ({instance.email})",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.ADMIN_EMAILS,
            fail_silently=False,
        )

        # --- Acknowledgment email to user ---
        send_mail(
            subject="✅ Your IT Support Ticket Has Been Received",
            message=f"Hello {instance.name},\n\n"
                    f"Thank you for contacting IT Support. "
                    f"We have received your ticket titled '{instance.title}'. "
                    f"Our team will review it and get back to you shortly.\n\n"
                    f"Best regards,\nIT Support Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],  
            fail_silently=False,
        )
