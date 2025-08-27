from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.chat_users, name='chat_users'),
    path('history/<str:username>/', views.chat_history, name='chat_history'),
    path('send/<str:username>/', views.send_message, name='send_message'),
    path('mark-read/<str:username>/', views.mark_messages_as_read, name='mark_messages_as_read'),
]
