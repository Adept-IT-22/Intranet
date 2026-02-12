"""
Simple script to create test users via API
Make sure your backend is running on http://localhost:8000
Run: python create_users_simple.py
"""

import requests

API_BASE = "http://localhost:8000/api"

# Test users to create
test_users = [
    {'username': 'alice', 'email': 'alice@example.com', 'password': 'password123'},
    {'username': 'bob', 'email': 'bob@example.com', 'password': 'password123'},
    {'username': 'charlie', 'email': 'charlie@example.com', 'password': 'password123'},
    {'username': 'diana', 'email': 'diana@example.com', 'password': 'password123'},
    {'username': 'eve', 'email': 'eve@example.com', 'password': 'password123'},
]

print("Creating test users via API...")
print("=" * 60)

for user in test_users:
    try:
        response = requests.post(f"{API_BASE}/signup/", json=user)
        if response.status_code == 200:
            print(f"[OK] Created: {user['username']}")
        else:
            error = response.json().get('error', 'Unknown error')
            print(f"[WARN] {user['username']}: {error}")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to backend. Make sure it's running on http://localhost:8000")
        break
    except Exception as e:
        print(f"[ERROR] Error creating {user['username']}: {e}")

print("\n" + "=" * 60)
print("Login Credentials:")
print("=" * 60)
for user in test_users:
    print(f"Username: {user['username']:<15} Password: {user['password']}")

