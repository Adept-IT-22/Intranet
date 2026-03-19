#!/usr/bin/env python3
"""
Simple script to check users in the database
Run this on your Linux server
"""
import psycopg2
import os

def check_users():
    """Connect to PostgreSQL and list all users"""
    
    # Database connection parameters
    db_config = {
        'host': 'localhost',
        'port': '5432',
        'database': 'intranetdb',
        'user': 'intranetuser',
        'password': 'intranetpass'
    }
    
    try:
        # Connect to database
        print("🔍 Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        # Check if auth_user table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'auth_user'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("❌ auth_user table does not exist. Database might not be initialized.")
            return
        
        # Get all users
        cursor.execute("""
            SELECT id, username, email, first_name, last_name, 
                   is_active, is_staff, is_superuser, 
                   date_joined, last_login
            FROM auth_user 
            ORDER BY id;
        """)
        
        users = cursor.fetchall()
        
        print(f"\n📊 Total users found: {len(users)}")
        print("=" * 80)
        
        if len(users) == 0:
            print("No users found in the database.")
        else:
            for user in users:
                print(f"ID: {user[0]}")
                print(f"Username: {user[1]}")
                print(f"Email: {user[2]}")
                print(f"First Name: {user[3]}")
                print(f"Last Name: {user[4]}")
                print(f"Active: {user[5]}")
                print(f"Staff: {user[6]}")
                print(f"Superuser: {user[7]}")
                print(f"Date Joined: {user[8]}")
                print(f"Last Login: {user[9]}")
                print("-" * 40)
        
        # Check for any other user-related tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE '%user%' 
            AND table_schema = 'public';
        """)
        
        user_tables = cursor.fetchall()
        if user_tables:
            print(f"\n🔍 Other user-related tables found: {[table[0] for table in user_tables]}")
        
        cursor.close()
        conn.close()
        print("\n✅ Database check completed!")
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_users()
