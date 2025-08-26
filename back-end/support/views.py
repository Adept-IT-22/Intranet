from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]  # ✅ only authenticated users

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()

        # ✅ Send email to admin
        admin_email = "admin@yourcompany.com"  # replace with your admin email
        subject = f"New IT Support Ticket: {ticket.title}"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [admin_email]

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px;">
            <img src='https://your-company-logo-url.com/logo.png' alt='Company Logo' style='width:120px; margin-bottom:20px;'/>
            <h2 style='color:#004080;'>New IT Support Ticket</h2>
            <p><strong>Title:</strong> {ticket.title}</p>
            <p><strong>Name:</strong> {ticket.name}</p>
            <p><strong>Email:</strong> {ticket.email}</p>
            <p><strong>Category:</strong> {ticket.category}</p>
            <p><strong>Description:</strong><br/>{ticket.description}</p>
            <p style='margin-top:30px; color:#666;'>This is an automated notification.</p>
          </div>
        </body>
        </html>
        """

        msg = EmailMultiAlternatives(subject, ticket.description, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
