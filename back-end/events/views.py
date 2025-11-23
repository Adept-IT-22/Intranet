from django.shortcuts import render
from rest_framework import viewsets
from .models import CalendarEvent
from .serializers import CalendarEventSerializer
from .utils import send_invites  # we'll add this next

class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all().order_by("start")
    serializer_class = CalendarEventSerializer

    def perform_create(self, serializer):
        event = serializer.save()
        # Send email invites if attendees exist
        if event.attendees:
            send_invites(event.title, event.start, event.end, event.attendees)
