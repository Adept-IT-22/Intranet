from django.core.mail import send_mail
from icalendar import Calendar, Event
from datetime import datetime
import pytz

def parse_attendees(attendees_str):
    """Convert 'a@gmail.com, b@yahoo.com' → ['a@gmail.com', 'b@yahoo.com']"""
    return [email.strip() for email in attendees_str.split(",") if email.strip()]

def send_invites(title, start, end, attendees):
    emails = parse_attendees(attendees)

    subject = f"📅 Meeting Invite: {title}"
    message = f"""
    📅 You have been invited to a meeting!

    Title: {title}
    Start: {start}
    End: {end}

    Click the attached invite to add it to your calendar.
    """

    # Convert string -> datetime
    start_dt = pytz.UTC.localize(datetime.fromisoformat(start))
    end_dt = pytz.UTC.localize(datetime.fromisoformat(end))

    # ✅ Generate ICS file
    ics_content = create_ics_event(title, start_dt, end_dt)

    # ✅ Send email with ICS attachment
    email = EmailMessage(subject, message, None, emails)
    email.attach("invite.ics", ics_content, "text/calendar")
    email.send()


def create_ics_event(title, start, end):
    cal = Calendar()
    cal.add('prodid', '-//Django Calendar//')
    cal.add('version', '2.0')

    event = Event()
    event.add('summary', title)
    event.add('dtstart', start)
    event.add('dtend', end)
    event.add('dtstamp', datetime.now(pytz.UTC))
    cal.add_component(event)

    return cal.to_ical()

    