import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from chat.models import ChatMessage
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

# Check users active in last 15 minutes (sent messages)
recent = timezone.now() - timedelta(minutes=15)
recent_messages = ChatMessage.objects.filter(timestamp__gte=recent).select_related('sender')

active_user_ids = set()
active_users_list = []

for msg in recent_messages:
    if msg.sender.id not in active_user_ids:
        active_user_ids.add(msg.sender.id)
        active_users_list.append({
            'username': msg.sender.username,
            'last_activity': msg.timestamp,
        })

print(f"\n{'='*50}")
print(f"ACTIVE USERS REPORT")
print(f"{'='*50}")
print(f"\nTotal users in database: {User.objects.count()}")
print(f"Users active in last 15 minutes: {len(active_users_list)}")

if active_users_list:
    print("\nActive users:")
    for user in active_users_list:
        print(f"  - {user['username']} (last activity: {user['last_activity']})")
else:
    print("\nNo users have been active in the last 15 minutes.")
    print("(This means no messages were sent in that time period)")

print(f"\n{'='*50}\n")

