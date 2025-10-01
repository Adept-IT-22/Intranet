from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        announcements = Announcement.objects.all().order_by('-date')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnnouncementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return None

    def delete(self, request, pk):
        announcement = self.get_object(pk)
        if not announcement:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        announcement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
