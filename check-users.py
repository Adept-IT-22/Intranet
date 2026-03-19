#!/usr/bin/env python3
"""
Script to check all users in the database
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "back-end"
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')

# Setup Django
django.setup()

from django.contrib.auth.models import User
from django.db import connection

def check_database_connection():
    """Check if database connection is working"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def list_all_users():
    """List all users in the database"""
    try:
        users = User.objects.all()
        print(f"\n📊 Total users in database: {users.count()}")
        print("=" * 60)
        
        if users.count() == 0:
            print("No users found in the database.")
            return
        
        for i, user in enumerate(users, 1):
            print(f"{i:2d}. Username: {user.username}")
            print(f"    Email: {user.email}")
            print(f"    First Name: {user.first_name}")
            print(f"    Last Name: {user.last_name}")
            print(f"    Is Active: {user.is_active}")
            print(f"    Is Staff: {user.is_staff}")
            print(f"    Is Superuser: {user.is_superuser}")
            print(f"    Date Joined: {user.date_joined}")
            print(f"    Last Login: {user.last_login}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error listing users: {e}")

def check_user_profiles():
    """Check if there are any custom user profiles"""
    try:
        from django.apps import apps
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Check if there are any custom user models
        print(f"\n🔍 User model: {User}")
        print(f"🔍 User model fields: {[field.name for field in User._meta.fields]}")
        
        # Check for any related models
        related_models = []
        for field in User._meta.get_fields():
            if hasattr(field, 'related_model') and field.related_model:
                related_models.append(field.name)
        
        if related_models:
            print(f"🔍 Related models: {related_models}")
        
    except Exception as e:
        print(f"❌ Error checking user profiles: {e}")

if __name__ == "__main__":
    print("🔍 Checking Intranet Database Users")
    print("=" * 50)
    
    # Check database connection
    if not check_database_connection():
        print("\n❌ Cannot connect to database. Please check:")
        print("1. Database service is running")
        print("2. Environment variables are set correctly")
        print("3. Database credentials are correct")
        sys.exit(1)
    
    # List all users
    list_all_users()
    
    # Check user profiles
    check_user_profiles()
    
    print("\n✅ User check completed!")