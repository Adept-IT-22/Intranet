# 🚀 Deploy to Render WITHOUT Docker

Deploy your app to Render using native buildpacks (no Docker needed)!

## 🎯 Why No Docker?

- ✅ **Simpler setup** - Render handles everything
- ✅ **Faster builds** - No Docker image building
- ✅ **Automatic detection** - Render detects Python/Node automatically
- ✅ **Less configuration** - Just point to your code

## 📋 Prerequisites

- ✅ GitHub repository: https://github.com/Adept-IT-22/Intranet
- ✅ Render account
- ✅ PostgreSQL database (you have this! ✅)

## 🚀 Step-by-Step: Backend (Django)

### Step 1: Create Backend Service

1. In Render Dashboard, click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - Search: `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure Service:**
   - **Name**: `adept-intranet-backend`
   - **Region**: `Ohio (US East)` (or closest)
   - **Branch**: `main`
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Python 3** (NOT Docker!)
   - **Build Command**: 
     ```
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```
     gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

4. **Environment Variables:**
   
   Get your **Internal Database URL** from PostgreSQL:
   - Go to PostgreSQL → **"Info"** tab
   - Copy **"Internal Database URL"**
   
   Add these:
   ```
   DATABASE_URL = (paste Internal Database URL)
   ALLOWED_HOSTS = adept-intranet-backend.onrender.com,localhost,127.0.0.1
   DEBUG = False
   SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_urlsafe(50))")
   CORS_ALLOWED_ORIGINS = https://adept-intranet-frontend.onrender.com
   PYTHON_VERSION = 3.11
   ```

5. **Auto-Deploy**: ✅ Make sure it's **ON**

6. Click **"Create Web Service"**

7. **Run Migrations:**
   - After deployment, go to **"Shell"** tab
   - Run: `python manage.py migrate`

## 🚀 Step-by-Step: Frontend (React)

### Option A: Static Site (Recommended for Frontend)

1. Click **"+ New"** → **"Static Site"**

2. **Connect Repository:**
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

5. Click **"Create Static Site"**

### Option B: Web Service (If you need server-side features)

1. Click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - Select `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure:**
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `Intranet/frontend`
   - **Runtime**: **Node**
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npx serve -s dist -l $PORT
     ```
   - Or use a simple Node server (see below)

4. **Environment Variables:**
   ```
   REACT_APP_API_URL = https://adept-intranet-backend.onrender.com
   PORT = 10000
   ```

5. Click **"Create Web Service"**

## 📝 Update Frontend API Configuration

**Update `Intranet/frontend/src/api.js`:**

```javascript
// Use environment variable or default to Render backend
const baseURL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD 
    ? 'https://adept-intranet-backend.onrender.com/api/' 
    : '/api/');

const api = axios.create({
  baseURL,
});
```

## 🔧 Create Simple Node Server (If using Web Service)

If you choose Web Service for frontend, create `Intranet/frontend/server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from dist
app.use('/Intranet', express.static(path.join(__dirname, 'dist')));

// Redirect root to /Intranet
app.get('/', (req, res) => {
  res.redirect('/Intranet/');
});

// API proxy
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api', createProxyMiddleware({
  target: process.env.REACT_APP_API_URL || 'https://adept-intranet-backend.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Add to `Intranet/frontend/package.json`:**

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}
```

## 🔄 Automatic Deployments

**Same as Docker version:**
- ✅ Connect GitHub repository
- ✅ Enable Auto-Deploy
- ✅ Push code → Auto-deploys!

## 📊 Comparison: Docker vs No Docker

| Feature | Docker | No Docker |
|---------|--------|-----------|
| Setup Complexity | Medium | Simple |
| Build Time | Slower | Faster |
| Configuration | More | Less |
| Flexibility | High | Medium |
| Best For | Complex apps | Simple apps |

## ✅ Checklist

- [ ] Backend service created (Python runtime)
- [ ] Frontend service created (Static Site or Node)
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API URL configured in frontend
- [ ] App accessible

## 🆘 Troubleshooting

### Backend won't start?
- Check **Start Command** is correct
- Verify `gunicorn` is in requirements.txt
- Check logs for errors

### Frontend can't connect to backend?
- Verify `VITE_API_BASE` or `REACT_APP_API_URL` is set
- Check CORS settings in backend
- Verify backend URL is correct

### Build fails?
- Check **Build Command** syntax
- Verify all dependencies in package.json/requirements.txt
- Check logs for specific errors

## 🎉 That's It!

Your app is deployed without Docker! 🚀

**Your App URLs:**
- Frontend: `https://adept-intranet-frontend.onrender.com/Intranet/`
- Backend: `https://adept-intranet-backend.onrender.com/api/`

