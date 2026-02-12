#!/usr/bin/env python
"""
Script to create test users for the chat application
Run: python manage.py shell < create_test_users.py
Or: python manage.py shell
Then copy-paste the code below
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Test users to create
test_users = [
    {
        'username': 'alice',
        'email': 'alice@example.com',
        'password': 'password123',
        'first_name': 'Alice',
        'last_name': 'Smith',
        'role': 'employee',
        'department': 'it',
    },
    {
        'username': 'bob',
        'email': 'bob@example.com',
        'password': 'password123',
        'first_name': 'Bob',
        'last_name': 'Jones',
        'role': 'employee',
        'department': 'hr',
    },
    {
        'username': 'charlie',
        'email': 'charlie@example.com',
        'password': 'password123',
        'first_name': 'Charlie',
        'last_name': 'Brown',
        'role': 'manager',
        'department': 'finance',
    },
    {
        'username': 'diana',
        'email': 'diana@example.com',
        'password': 'password123',
        'first_name': 'Diana',
        'last_name': 'Wilson',
        'role': 'admin',
        'department': 'it',
    },
    {
        'username': 'eve',
        'email': 'eve@example.com',
        'password': 'password123',
        'first_name': 'Eve',
        'last_name': 'Davis',
        'role': 'employee',
        'department': 'marketing',
    },
]

print("Creating test users...")
created_count = 0
for user_data in test_users:
    username = user_data['username']
    if User.objects.filter(username=username).exists():
        print(f"⚠️  User '{username}' already exists, skipping...")
        continue
    
    user = User.objects.create_user(
        username=username,
        email=user_data['email'],
        password=user_data['password'],
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        role=user_data.get('role'),
        department=user_data.get('department'),
    )
    print(f"✅ Created user: {username} ({user_data['first_name']} {user_data['last_name']})")
    created_count += 1

print(f"\n🎉 Successfully created {created_count} test users!")
print("\nLogin credentials:")
print("=" * 50)
for user_data in test_users:
    print(f"Username: {user_data['username']}")
    print(f"Password: {user_data['password']}")
    print(f"Email: {user_data['email']}")
    print("-" * 50)

