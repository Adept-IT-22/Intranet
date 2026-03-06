# PowerShell script to check users on the Linux server
param(
    [string]$ServerIP = "172.171.244.92",
    [string]$Username = "administrator"
)

Write-Host "🔍 Checking users on Linux server..." -ForegroundColor Green

Write-Host "📤 Running user check on server..." -ForegroundColor Yellow

# Use SSH to run the check directly
$sshCommand = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'cd /home/administrator/Intranet && python3 -c \"
import psycopg2
import os

def check_users():
    db_config = {
        'host': 'localhost',
        'port': '5432',
        'database': 'intranetdb',
        'user': 'intranetuser',
        'password': 'intranetpass'
    }
    
    try:
        print('🔍 Connecting to PostgreSQL database...')
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        # Check if auth_user table exists
        cursor.execute('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \\'auth_user\\');')
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print('❌ auth_user table does not exist.')
            return
        
        # Get all users
        cursor.execute('SELECT id, username, email, first_name, last_name, is_active, is_staff, is_superuser, date_joined, last_login FROM auth_user ORDER BY id;')
        
        users = cursor.fetchall()
        
        print(f'\\n📊 Total users found: {len(users)}')
        print('=' * 80)
        
        if len(users) == 0:
            print('No users found in the database.')
        else:
            for user in users:
                print(f'ID: {user[0]}')
                print(f'Username: {user[1]}')
                print(f'Email: {user[2]}')
                print(f'First Name: {user[3]}')
                print(f'Last Name: {user[4]}')
                print(f'Active: {user[5]}')
                print(f'Staff: {user[6]}')
                print(f'Superuser: {user[7]}')
                print(f'Date Joined: {user[8]}')
                print(f'Last Login: {user[9]}')
                print('-' * 40)
        
        cursor.close()
        conn.close()
        print('\\n✅ Database check completed!')
        
    except Exception as e:
        print(f'❌ Error: {e}')

check_users()
\"'"

try {
    Invoke-Expression $sshCommand
    Write-Host "✅ User check completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error running user check: $_" -ForegroundColor Red
    Write-Host "You can also run this manually on your server:" -ForegroundColor Yellow
    Write-Host "1. SSH into your server: ssh administrator@172.171.244.92" -ForegroundColor Yellow
    Write-Host "2. Run: cd /home/administrator/Intranet" -ForegroundColor Yellow
    Write-Host "3. Run: python3 check-users-simple.py" -ForegroundColor Yellow
}
