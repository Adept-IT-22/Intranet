from django.urls import path
from . import views

urlpatterns = [
    # Direct chat endpoints (backward compatible)
    path('users/', views.chat_users, name='chat_users'),
    path('history/<str:username>/', views.chat_history, name='chat_history'),
    path('send/<str:username>/', views.send_message, name='send_message'),
    path('mark-read/<str:username>/', views.mark_messages_as_read, name='mark_messages_as_read'),
    
    # Conversation endpoints (both direct and group)
    path('conversations/', views.list_conversations, name='list_conversations'),
    path('conversations/create-direct/', views.create_or_get_direct_chat, name='create_direct_chat'),
    path('conversations/create-group/', views.create_group_chat, name='create_group_chat'),
    path('conversations/<uuid:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<uuid:conversation_id>/messages/', views.get_conversation_messages, name='get_conversation_messages'),
    path('conversations/<uuid:conversation_id>/send/', views.send_conversation_message, name='send_conversation_message'),
    path('conversations/<uuid:conversation_id>/messages/<uuid:message_id>/edit/', views.edit_message, name='edit_message'),
    path('conversations/<uuid:conversation_id>/messages/<uuid:message_id>/delete/', views.delete_message, name='delete_message'),
    path('conversations/<uuid:conversation_id>/update-name/', views.update_conversation_name, name='update_conversation_name'),
    path('conversations/<uuid:conversation_id>/add-participants/', views.add_participants, name='add_participants'),
    path('conversations/<uuid:conversation_id>/remove-participant/', views.remove_participant, name='remove_participant'),
]
