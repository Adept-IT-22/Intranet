#!/usr/bin/env python
"""
Script to create a super admin user for the intranet system.
Run: python manage.py shell < create_super_admin.py
Or: python create_super_admin.py (if run from manage.py directory)
"""
import os
import sys
import django

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

# Super Admin Credentials
SUPER_ADMIN_USERNAME = "superadmin"
SUPER_ADMIN_EMAIL = "superadmin@adept-techno.com"
SUPER_ADMIN_PASSWORD = "AdeptSuperAdmin2025!"  # Change this after first login!
SUPER_ADMIN_FIRST_NAME = "Super"
SUPER_ADMIN_LAST_NAME = "Admin"

def create_super_admin():
    try:
        # Check if super admin already exists
        if User.objects.filter(username=SUPER_ADMIN_USERNAME).exists():
            user = User.objects.get(username=SUPER_ADMIN_USERNAME)
            user.role = 'super_admin'
            user.set_password(SUPER_ADMIN_PASSWORD)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"✅ Updated existing user '{SUPER_ADMIN_USERNAME}' to super admin")
        else:
            # Create new super admin
            user = User.objects.create_user(
                username=SUPER_ADMIN_USERNAME,
                email=SUPER_ADMIN_EMAIL,
                password=SUPER_ADMIN_PASSWORD,
                first_name=SUPER_ADMIN_FIRST_NAME,
                last_name=SUPER_ADMIN_LAST_NAME,
                role='super_admin',
                is_staff=True,
                is_superuser=True,
            )
            print(f"✅ Created super admin user: {SUPER_ADMIN_USERNAME}")
        
        print("\n" + "="*60)
        print("SUPER ADMIN CREDENTIALS")
        print("="*60)
        print(f"Username: {SUPER_ADMIN_USERNAME}")
        print(f"Password: {SUPER_ADMIN_PASSWORD}")
        print(f"Email: {SUPER_ADMIN_EMAIL}")
        print("="*60)
        print("\n⚠️  IMPORTANT: Change the password after first login!")
        print("="*60)
        
        return user
    except IntegrityError as e:
        print(f"❌ Error creating super admin: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

if __name__ == "__main__":
    create_super_admin()

