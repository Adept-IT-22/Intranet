# 🎯 Complete Render Setup - Step by Step

This is your complete guide to deploy to Render with GitHub integration.

## 📋 Prerequisites Checklist

- [ ] GitHub repository: https://github.com/Adept-IT-22/Intranet
- [ ] Render account (sign up at https://render.com)
- [ ] PostgreSQL database created in Render (you have this! ✅)

## 🚀 Complete Setup (15 minutes)

### Part 1: Connect GitHub to Render (2 min)

1. Go to https://render.com
2. **Sign up with GitHub** (or sign in if you have account)
3. Authorize Render to access your repositories
4. ✅ Done! GitHub is now connected

### Part 2: Create Backend Service (5 min)

1. In Render Dashboard, click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - Search: `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure:**
   - **Name**: `adept-intranet-backend`
   - **Region**: `Ohio (US East)` (or closest)
   - **Branch**: `main`
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Intranet/back-end/Dockerfile`
   - **Docker Context**: `Intranet/back-end`

4. **Environment Variables** (Click "Add Environment Variable"):
   
   Get your **Internal Database URL** from your PostgreSQL service:
   - Go to your PostgreSQL → **"Info"** tab
   - Click eye icon next to **"Internal Database URL"**
   - Copy the URL
   
   Add these variables:
   ```
   DATABASE_URL = (paste Internal Database URL)
   ALLOWED_HOSTS = adept-intranet-backend.onrender.com,localhost,127.0.0.1
   DEBUG = False
   SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_urlsafe(50))")
   CORS_ALLOWED_ORIGINS = https://adept-intranet-frontend.onrender.com
   ```

5. **Auto-Deploy**: ✅ Make sure it's **ON**

6. Click **"Create Web Service"**

7. **Wait 5-10 minutes** for first deployment

### Part 3: Create Frontend Service (5 min)

1. Click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - Select `Adept-IT-22/Intranet`
   - Click **"Connect"**

3. **Configure:**
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `.` (root)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.nginx`
   - **Docker Context**: `.`

4. **Environment Variables:**
   ```
   BACKEND_URL = https://adept-intranet-backend.onrender.com
   ```

5. **Important: Update nginx.conf first!**
   
   Before deploying, update `nginx.conf`:
   - Open `nginx.conf`
   - Find: `proxy_pass http://intranet-backend:8000/api/;`
   - Replace with: `proxy_pass https://adept-intranet-backend.onrender.com/api/;`
   - Also update `/ws/` location
   - Commit and push:
     ```bash
     git add nginx.conf
     git commit -m "Update nginx for Render"
     git push
     ```

6. **Auto-Deploy**: ✅ Make sure it's **ON**

7. Click **"Create Web Service"**

8. **Wait 5-10 minutes** for first deployment

### Part 4: Run Database Migrations (2 min)

After backend is deployed:

1. Go to your backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

Or migrations will run automatically on startup (already configured in Dockerfile).

### Part 5: Verify Everything Works (1 min)

1. **Check backend:**
   - URL: `https://adept-intranet-backend.onrender.com/api/`
   - Should return API response

2. **Check frontend:**
   - URL: `https://adept-intranet-frontend.onrender.com/Intranet/`
   - Should load your app

3. **Test login:**
   - Try logging in
   - Verify API calls work

## ✅ Final Checklist

- [ ] GitHub connected to Render
- [ ] PostgreSQL database created
- [ ] Backend service created and deployed
- [ ] Frontend service created and deployed
- [ ] Environment variables set
- [ ] nginx.conf updated for Render
- [ ] Database migrations run
- [ ] App accessible and working

## 🔄 How Updates Work Now

**Every time you push to GitHub:**

1. Render automatically detects the push
2. Builds new Docker images
3. Deploys new version
4. Your app updates automatically!

**Just do:**
```bash
git add .
git commit -m "Update"
git push
```

That's it! 🚀

## 📊 Monitor Deployments

- **Render Dashboard**: See all services and their status
- **Events Tab**: See deployment history
- **Logs Tab**: View application logs

## 🆘 Need Help?

- **Deployment fails?** → Check Logs tab
- **App won't start?** → Check environment variables
- **Can't connect?** → Verify URLs and CORS settings

## 🎉 You're Done!

Your app is now:
- ✅ Deployed to Render
- ✅ Connected to GitHub
- ✅ Auto-deploying on every push
- ✅ Using PostgreSQL database
- ✅ Live and accessible!

**Your App URLs:**
- Frontend: `https://adept-intranet-frontend.onrender.com/Intranet/`
- Backend: `https://adept-intranet-backend.onrender.com/api/`

