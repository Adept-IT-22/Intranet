# ⚡ Render Simple Setup - No Docker Required

The easiest way to deploy to Render - no Docker needed!

## 🎯 Quick Overview

- **Backend**: Python Web Service (Django)
- **Frontend**: Static Site (React build)
- **Database**: PostgreSQL (you already have this! ✅)

## 🚀 Complete Setup (10 minutes)

### Step 1: Deploy Backend (5 min)

1. In Render Dashboard, click **"+ New"** → **"Web Service"**

2. **Connect GitHub:**
   - Search: `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure:**
   - **Name**: `adept-intranet-backend`
   - **Region**: `Ohio (US East)`
   - **Branch**: `main`
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Python 3** ⚠️ (NOT Docker!)
   - **Build Command**: 
     ```
     pip install -r requirements.txt && python manage.py migrate --noinput
     ```
   - **Start Command**: 
     ```
     gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

4. **Environment Variables:**
   
   Get from your PostgreSQL (Info tab → Internal Database URL):
   ```
   DATABASE_URL = (paste from PostgreSQL)
   ALLOWED_HOSTS = adept-intranet-backend.onrender.com,localhost,127.0.0.1
   DEBUG = False
   SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_urlsafe(50))")
   CORS_ALLOWED_ORIGINS = https://adept-intranet-frontend.onrender.com
   PYTHON_VERSION = 3.11
   ```

5. ✅ **Auto-Deploy**: ON

6. Click **"Create Web Service"**

### Step 2: Deploy Frontend (3 min)

1. Click **"+ New"** → **"Static Site"** ⚠️ (NOT Web Service!)

2. **Connect GitHub:**
   - Select `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure:**
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `Intranet/frontend`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. **Environment Variables:**
   ```
   VITE_API_BASE = https://adept-intranet-backend.onrender.com/api/
   ```

5. ✅ **Auto-Deploy**: ON

6. Click **"Create Static Site"**

### Step 3: Update Frontend API Config (2 min)

**Update `Intranet/frontend/src/api.js`:**

```javascript
// src/api.js
import axios from "axios";

// Use environment variable or default to Render backend
const baseURL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD 
    ? 'https://adept-intranet-backend.onrender.com/api/' 
    : '/api/');

const api = axios.create({
  baseURL,
});

// Always attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Commit and push:**
```bash
git add Intranet/frontend/src/api.js
git commit -m "Update API URL for Render"
git push
```

## ✅ Done!

Your app URLs:
- **Frontend**: `https://adept-intranet-frontend.onrender.com/Intranet/`
- **Backend**: `https://adept-intranet-backend.onrender.com/api/`

## 🔄 Automatic Updates

Every push to GitHub automatically deploys!

```bash
git add .
git commit -m "Update"
git push
# Render automatically deploys!
```

## 📊 What Render Does

**Backend:**
- Detects Python
- Installs dependencies from `requirements.txt`
- Runs migrations
- Starts with gunicorn

**Frontend:**
- Detects Node.js
- Runs `npm install`
- Runs `npm run build`
- Serves static files from `dist`

## 🆘 Troubleshooting

### Backend fails to start?
- Check **Start Command** has `gunicorn`
- Verify `gunicorn` in `requirements.txt`
- Check logs for errors

### Frontend can't connect?
- Verify `VITE_API_BASE` is set
- Check backend CORS settings
- Verify backend URL is correct

### Build fails?
- Check **Root Directory** is correct
- Verify `package.json` has build script
- Check logs for specific errors

## 💡 Tips

- **Static Site** is perfect for React apps (no server needed)
- **Web Service** only if you need server-side features
- **Auto-Deploy** means you never manually deploy again!

## 🎉 That's It!

No Docker, no complexity - just simple deployment! 🚀

