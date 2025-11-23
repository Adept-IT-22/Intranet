# Super Admin Setup & Credentials

## Super Admin Credentials

**Username:** `superadmin`  
**Password:** `AdeptSuperAdmin2025!`  
**Email:** `superadmin@adept-techno.com`

⚠️ **IMPORTANT:** Change the password after first login!

## Setup Instructions

### 1. Run Database Migrations

```bash
cd Intranet/back-end
python manage.py makemigrations
python manage.py migrate
```

### 2. Create Super Admin User

```bash
cd Intranet/back-end
python create_super_admin.py
```

Or using Django shell:
```bash
python manage.py shell
>>> exec(open('create_super_admin.py').read())
```

### 3. Verify Super Admin

The script will output the credentials. You can also verify by logging in with the credentials above.

## Features Enabled for Super Admin

1. **Create Announcements** - Only super admins can create/edit/delete announcements
2. **Announcement Events** - Announcements with event dates will appear on the calendar
3. **Full Access** - Super admins can see all announcements (including inactive ones)

## Announcements Features

- **Create/Edit/Delete** - Super admins can manage all announcements
- **Event Dates** - Add event dates to announcements to show them on the calendar
- **Priority Levels** - Set priority (Low, Normal, High, Urgent)
- **Calendar Integration** - Announcements with event dates automatically appear on the calendar

## Browser Notifications

- Users will be prompted to allow notifications when they first visit the chat page
- Notifications appear when:
  - A new message is received (not from yourself)
  - The browser tab is not visible (to avoid duplicate notifications)
- Notifications show sender name and message preview

## Testing

1. Login with super admin credentials
2. Navigate to Announcements page
3. Click "Create Announcement"
4. Fill in the form and optionally add an event date
5. Save - the announcement will appear on the Announcements page
6. If event date is set, it will also appear on the Calendar page

