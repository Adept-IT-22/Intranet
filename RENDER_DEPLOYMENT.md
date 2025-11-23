# 🚀 Deploy to Render - Complete Guide

Deploy your Adept Intranet application to Render (both frontend and backend).

## 🎯 Why Render?

- ✅ **Simple setup** - No complex configuration
- ✅ **Free tier available** - Good for testing
- ✅ **Automatic deployments** - From GitHub
- ✅ **Managed PostgreSQL** - Database included
- ✅ **Easy scaling** - Upgrade when needed

## 📋 Prerequisites

1. ✅ GitHub repository (you have: https://github.com/Adept-IT-22/Intranet)
2. ✅ Render account (sign up at https://render.com)

## 🏗️ Architecture on Render

- **Backend**: Web Service (Django)
- **Frontend**: Web Service (Nginx serving React)
- **Database**: PostgreSQL (Render managed)
- **Redis**: Optional (for WebSockets/chat)

## 🚀 Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"+ New"**
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `adept-intranet-db`
   - **Database**: `intranet`
   - **User**: `intranet_user` (or leave default)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: `16` (or latest)
   - **Plan**: **Free** (for testing) or **Starter** ($7/month)
4. Click **"Create Database"**
5. **Save the connection string** - You'll need it!

**Get Database URL:**
- After creation, click on your database
- Copy the **"Internal Database URL"** or **"External Database URL"**
- Format: `postgresql://user:password@host:port/database`

### Step 3: Deploy Backend (Django)

1. In Render Dashboard, click **"+ New"**
2. Select **"Web Service"**
3. Connect your repository:
   - **Repository**: `Adept-IT-22/Intranet`
   - Click **"Connect"**
4. Configure service:
   - **Name**: `adept-intranet-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Intranet/back-end/Dockerfile`
   - **Docker Context**: `Intranet/back-end`
5. **Environment Variables:**
   Click **"Add Environment Variable"** and add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (From Step 2 - PostgreSQL connection string) |
   | `ALLOWED_HOSTS` | `adept-intranet-backend.onrender.com,localhost,127.0.0.1` |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | (Generate a secure key - see below) |
   | `REDIS_URL` | (Optional - if using Redis) |
   | `CORS_ALLOWED_ORIGINS` | `https://adept-intranet-frontend.onrender.com` |

6. **Advanced Settings:**
   - **Build Command**: (Leave empty - Docker handles it)
   - **Start Command**: (Leave empty - Docker handles it)
   - **Plan**: **Free** (for testing) or **Starter** ($7/month)

7. Click **"Create Web Service"**

**Generate SECRET_KEY:**
```python
# Run this in Python:
import secrets
print(secrets.token_urlsafe(50))
```

### Step 4: Update Backend for Render

We need to update the backend to use PostgreSQL and Render's environment.

**Update `Intranet/back-end/backend/settings.py`:**

```python
import os
import dj_database_url

# Database configuration for Render
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# If DATABASE_URL not set, use SQLite for local dev
if not os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / "db.sqlite3",
        }
    }
```

**Update `Intranet/back-end/requirements.txt`:**

Add these if not present:
```
dj-database-url==2.1.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

**Update `Intranet/back-end/Dockerfile`:**

Make sure it uses gunicorn for production:

```dockerfile
# At the end of Dockerfile, replace CMD with:
CMD gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2
```

**Or update startup script:**
```dockerfile
# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
python manage.py migrate --noinput || true\n\
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
```

### Step 5: Deploy Frontend (React + Nginx)

1. In Render Dashboard, click **"+ New"**
2. Select **"Web Service"**
3. Connect repository:
   - **Repository**: `Adept-IT-22/Intranet`
   - Click **"Connect"**
4. Configure service:
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `.` (root)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.nginx`
   - **Docker Context**: `.`
5. **Environment Variables:**
   - `REACT_APP_API_URL` = `https://adept-intranet-backend.onrender.com`
6. **Advanced Settings:**
   - **Plan**: **Free** (for testing) or **Starter** ($7/month)
7. Click **"Create Web Service"**

### Step 6: Update Frontend for Render

**Update `Intranet/frontend/src/api.js`:**

Make sure it uses the Render backend URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://adept-intranet-backend.onrender.com' 
    : 'http://localhost:8000');
```

**Update `nginx.conf` for Render:**

Make sure it proxies to the backend:

```nginx
location /api/ {
    proxy_pass https://adept-intranet-backend.onrender.com/api/;
    # ... rest of proxy settings
}
```

### Step 7: Run Database Migrations

After backend deploys:

1. Go to your backend service in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

Or add to startup script (already done if you updated Dockerfile).

## 🔄 Automatic Deployments

Render automatically deploys when you push to GitHub!

1. **Make changes** locally
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
3. **Render detects changes** and redeploys automatically

## 🔗 Your App URLs

After deployment:
- **Frontend**: `https://adept-intranet-frontend.onrender.com/Intranet/`
- **Backend**: `https://adept-intranet-backend.onrender.com/api/`

## 💰 Pricing

**Free Tier:**
- ✅ Web Services (sleeps after 15 min inactivity)
- ✅ PostgreSQL (90 days free trial)
- ✅ 750 hours/month

**Starter Plan:**
- $7/month per service
- Always on
- Better performance

## 🆘 Troubleshooting

### Backend won't start
- Check **Logs** tab in Render
- Verify `DATABASE_URL` is set correctly
- Check `ALLOWED_HOSTS` includes Render URL

### Frontend can't connect to backend
- Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check backend is running
- Verify API URL in frontend config

### Database connection failed
- Check `DATABASE_URL` format
- Verify database is running
- Check network connectivity

### Build fails
- Check Dockerfile path is correct
- Verify all dependencies in requirements.txt
- Check build logs in Render

## 📝 Checklist

- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Backend service created
- [ ] Frontend service created
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] App accessible

## 🎉 That's It!

Your app is now live on Render! 🚀

