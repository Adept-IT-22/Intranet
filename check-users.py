#!/usr/bin/env python
"""
Script to check existing users in the database
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, 'back-end')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Checking existing users in the database...")
print("=" * 50)

users = User.objects.all()
if users.exists():
    print(f"Found {users.count()} user(s):")
    print()
    for user in users:
        print(f"👤 Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   First Name: {user.first_name}")
        print(f"   Last Name: {user.last_name}")
        print(f"   Role: {getattr(user, 'role', 'Not set')}")
        print(f"   Department: {getattr(user, 'department', 'Not set')}")
        print(f"   Team: {getattr(user, 'team', 'Not set')}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Active: {user.is_active}")
        print("-" * 30)
else:
    print("❌ No users found in the database.")
    print("The database might be empty or not migrated yet.")
