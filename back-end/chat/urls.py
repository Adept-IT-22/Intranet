from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.chat_users, name='chat_users'),
    path('conversations/', views.list_conversations, name='list_conversations'),
    path('conversations/create-direct/', views.create_direct_conversation, name='create_direct_conversation'),
    path('conversations/create-group/', views.create_group_conversation, name='create_group_conversation'),
    path('conversations/<str:conversation_id>/', views.get_conversation_details, name='get_conversation_details'),
    path('conversations/<str:conversation_id>/history/', views.get_conversation_history, name='get_conversation_history'),
    path('conversations/<str:conversation_id>/send/', views.send_message_to_conversation, name='send_message_to_conversation'),
    path('conversations/<str:conversation_id>/mark-read/', views.mark_conversation_as_read, name='mark_conversation_as_read'),
    path('conversations/<str:conversation_id>/messages/<int:message_id>/edit/', views.edit_chat_message, name='edit_chat_message'),

    path('conversations/<str:conversation_id>/messages/<int:message_id>/delete/', views.delete_chat_message, name='delete_chat_message'),
]
