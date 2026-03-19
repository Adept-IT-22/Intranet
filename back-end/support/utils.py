from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_ticket_email(ticket_data):
    """
    Sends an HTML-formatted support ticket email to admins.
    ticket_data: dict with keys: name, email, subject, category, description
    """
    subject = f"New Support Ticket: {ticket_data['subject']}"
    from_email = settings.DEFAULT_FROM_EMAIL
    to_emails = settings.ADMIN_EMAILS

    # HTML content with your brand colors: blue, red, orange, yellow
    html_content = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(90deg, #004080, #ff0000, #ff9900, #ffff00);
                padding: 20px;
                text-align: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }}
            .ticket-box {{
                background-color: #fff;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
                box-shadow: 0 0 8px rgba(0,0,0,0.1);
            }}
            .ticket-field {{
                margin-bottom: 15px;
            }}
            .ticket-field label {{
                font-weight: bold;
                display: block;
                margin-bottom: 5px;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #666;
                text-align: center;
            }}
            img.logo {{
                max-width: 150px;
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <img src="https://yourdomain.com/logo.png" alt="Adept Technologies" class="logo" />
            New Support Ticket
        </div>

        <div class="ticket-box">
            <div class="ticket-field">
                <label>Name:</label> {ticket_data['name']}
            </div>
            <div class="ticket-field">
                <label>Email:</label> {ticket_data['email']}
            </div>
            <div class="ticket-field">
                <label>Category:</label> {ticket_data['category']}
            </div>
            <div class="ticket-field">
                <label>Subject:</label> {ticket_data['subject']}
            </div>
            <div class="ticket-field">
                <label>Description:</label> {ticket_data['description']}
            </div>
        </div>

        <div class="footer">
            This is an automated email from Adept Technologies Support Center.
        </div>
    </body>
    </html>
    """

    # Create email
    email = EmailMultiAlternatives(subject=subject, body=ticket_data['description'],
                                   from_email=from_email, to=to_emails)
    email.attach_alternative(html_content, "text/html")
    email.send()
