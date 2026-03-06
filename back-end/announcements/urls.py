from django.urls import path
from .views import AnnouncementListCreateView, AnnouncementDetailView

urlpatterns = [
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcement-list'),  # GET & POST
    path('announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),  # DELETE
]
