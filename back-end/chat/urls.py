from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.chat_users, name='chat_users'),            # For user list
    path('history/<str:username>/', views.chat_history, name='chat_history'),  # For chat history
    path('mark-read/<str:username>/', views.mark_messages_as_read, name='mark-messages-read'),
]
