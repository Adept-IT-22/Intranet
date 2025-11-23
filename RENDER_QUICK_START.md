# ⚡ Render Quick Start - Deploy in 10 Minutes

## 🎯 Goal
Deploy both frontend and backend to Render - simple and fast!

## 📋 Prerequisites
- ✅ GitHub account
- ✅ Render account (sign up at https://render.com - free)

## 🚀 5 Simple Steps

### Step 1: Create Render Account (2 min)

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (recommended - one click!)
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database (2 min)

1. In Render Dashboard, click **"+ New"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `adept-intranet-db`
   - **Database**: `intranet`
   - **Region**: Choose closest (e.g., `Oregon (US West)`)
   - **Plan**: **Free** (for testing)
3. Click **"Create Database"**
4. **Copy the "Internal Database URL"** - You'll need it!

### Step 3: Deploy Backend (3 min)

1. Click **"+ New"** → **"Web Service"**
2. Connect repository:
   - Select **"Adept-IT-22/Intranet"**
   - Click **"Connect"**
3. Configure:
   - **Name**: `adept-intranet-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Intranet/back-end/Dockerfile`
4. **Environment Variables:**
   - `DATABASE_URL` = (Paste from Step 2)
   - `ALLOWED_HOSTS` = `adept-intranet-backend.onrender.com,localhost,127.0.0.1`
   - `DEBUG` = `False`
   - `SECRET_KEY` = (Generate: `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
   - `CORS_ALLOWED_ORIGINS` = `https://adept-intranet-frontend.onrender.com`
5. Click **"Create Web Service"**

### Step 4: Deploy Frontend (2 min)

1. Click **"+ New"** → **"Web Service"**
2. Connect repository:
   - Select **"Adept-IT-22/Intranet"**
3. Configure:
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `.` (root)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.nginx`
4. **Environment Variables:**
   - `BACKEND_URL` = `https://adept-intranet-backend.onrender.com`
5. Click **"Create Web Service"**

### Step 5: Wait for Deployment (1 min)

- Render will build and deploy automatically
- Watch the **Logs** tab to see progress
- First deployment takes 5-10 minutes

## ✅ Done!

Your app is live at:
- **Frontend**: `https://adept-intranet-frontend.onrender.com/Intranet/`
- **Backend**: `https://adept-intranet-backend.onrender.com/api/`

## 🔄 Automatic Updates

**Every time you push to GitHub:**
- Render automatically detects changes
- Rebuilds and redeploys
- Your app updates automatically!

## 💰 Cost

**Free Tier:**
- ✅ 750 hours/month
- ✅ Services sleep after 15 min inactivity
- ✅ Perfect for testing

**Starter Plan ($7/month per service):**
- Always on
- Better performance
- For production

## 🆘 Troubleshooting

**Backend won't start?**
- Check **Logs** tab
- Verify `DATABASE_URL` is correct
- Check `ALLOWED_HOSTS` includes Render URL

**Frontend can't connect?**
- Verify backend URL in frontend env vars
- Check backend is running
- Check CORS settings

**Need help?**
- See full guide: `RENDER_DEPLOYMENT.md`
- Check Render logs
- Render support: https://render.com/docs

## 📝 Checklist

- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Backend service created
- [ ] Frontend service created
- [ ] Environment variables set
- [ ] App accessible

---

**That's it! Your app is deployed! 🚀**

