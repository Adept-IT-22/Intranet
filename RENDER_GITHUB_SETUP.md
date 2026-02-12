# 🔗 Connect Render to GitHub - Automatic Deployments

Yes! Render can connect directly to GitHub for **automatic deployments** on every push!

## ✅ What This Gives You

- ✅ **Automatic deployments** - Every push to GitHub triggers a new deployment
- ✅ **No manual steps** - Just push code, Render handles the rest
- ✅ **Build from GitHub** - Render pulls code directly from your repo
- ✅ **Easy updates** - Update code → Push → Deploy automatically

## 🚀 How to Connect GitHub to Render

### Step 1: Authorize Render (First Time Only)

1. Go to https://render.com
2. Click **"Get Started for Free"** or **"Sign In"**
3. Click **"Sign up with GitHub"** (or **"Connect GitHub"** if already signed up)
4. Authorize Render to access your repositories
5. Select repositories to allow (or allow all)

### Step 2: Create Backend Service (Connected to GitHub)

1. In Render Dashboard, click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - You'll see **"Connect a repository"** section
   - Click **"Connect account"** if not connected
   - Search for: `Adept-IT-22/Intranet`
   - Click on your repository
   - Click **"Connect"**

3. **Configure Service:**
   - **Name**: `adept-intranet-backend`
   - **Region**: Choose closest (e.g., `Ohio (US East)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `Intranet/back-end`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Intranet/back-end/Dockerfile`
   - **Docker Context**: `Intranet/back-end`

4. **Environment Variables:**
   Click **"Add Environment Variable"** and add:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (From your PostgreSQL - Internal Database URL) |
   | `ALLOWED_HOSTS` | `adept-intranet-backend.onrender.com,localhost,127.0.0.1` |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | (Generate: `python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
   | `CORS_ALLOWED_ORIGINS` | `https://adept-intranet-frontend.onrender.com` |

5. **Auto-Deploy:**
   - ✅ **"Auto-Deploy"** should be **ON** (default)
   - This means every push to `main` branch will trigger deployment

6. Click **"Create Web Service"**

### Step 3: Create Frontend Service (Connected to GitHub)

1. Click **"+ New"** → **"Web Service"**

2. **Connect Repository:**
   - Select **"Adept-IT-22/Intranet"** (already connected)
   - Click **"Connect"**

3. **Configure Service:**
   - **Name**: `adept-intranet-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `.` (root)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.nginx`
   - **Docker Context**: `.`

4. **Environment Variables:**
   - `BACKEND_URL` = `https://adept-intranet-backend.onrender.com`

5. **Auto-Deploy:**
   - ✅ Make sure **"Auto-Deploy"** is **ON**

6. Click **"Create Web Service"**

## 🔄 How Automatic Deployments Work

### Workflow:

1. **You make changes** locally
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. **Render detects the push** (via GitHub webhook)
4. **Render automatically:**
   - Pulls latest code from GitHub
   - Builds Docker images
   - Deploys new version
   - Your app updates automatically!

### Timeline:

- **First deployment**: 5-10 minutes (builds everything)
- **Subsequent deployments**: 3-5 minutes (incremental builds)

## 📊 Monitor Deployments

1. **In Render Dashboard:**
   - Go to your service
   - Click **"Events"** tab
   - See all deployments and their status

2. **In GitHub:**
   - Go to your repository
   - Click **"Actions"** tab (if you have GitHub Actions)
   - Or check commit history

3. **Deployment Status:**
   - **Building** - Render is building your app
   - **Live** - Deployment successful, app is running
   - **Failed** - Check logs for errors

## ⚙️ Deployment Settings

### Manual Deploy

If you want to deploy manually:

1. Go to your service in Render
2. Click **"Manual Deploy"**
3. Select branch and commit
4. Click **"Deploy"**

### Deploy Specific Branch

1. Go to service settings
2. Change **"Branch"** to desired branch
3. Save
4. Render will deploy from that branch

### Deploy Specific Commit

1. Go to **"Events"** tab
2. Find the commit you want
3. Click **"Deploy"** next to that commit

## 🔐 GitHub Integration Features

### Webhooks

Render automatically sets up GitHub webhooks:
- Listens for pushes to your branch
- Triggers deployments automatically
- No manual configuration needed

### Build Logs

- See build progress in real-time
- View logs in Render dashboard
- Debug build issues easily

### Rollback

- Deploy previous versions
- One-click rollback
- View deployment history

## 🆘 Troubleshooting

### Deployments not triggering?

1. **Check GitHub connection:**
   - Go to Render Dashboard → Settings
   - Verify GitHub is connected
   - Re-authorize if needed

2. **Check Auto-Deploy:**
   - Go to service settings
   - Verify **"Auto-Deploy"** is **ON**

3. **Check branch:**
   - Make sure you're pushing to the branch Render is watching
   - Default is `main` or `master`

### Build fails?

1. **Check logs:**
   - Go to service → **"Logs"** tab
   - Look for error messages

2. **Common issues:**
   - Dockerfile path incorrect
   - Missing dependencies
   - Environment variables not set

### Service not updating?

1. **Check deployment status:**
   - Go to **"Events"** tab
   - Verify latest deployment is **"Live"**

2. **Force redeploy:**
   - Click **"Manual Deploy"**
   - Select latest commit
   - Click **"Deploy"**

## ✅ Checklist

- [ ] GitHub account connected to Render
- [ ] Repository connected to backend service
- [ ] Repository connected to frontend service
- [ ] Auto-Deploy enabled for both services
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Test: Push code and verify auto-deploy

## 🎉 That's It!

Once connected:
1. **Code** → Make changes
2. **Push** → `git push`
3. **Deploy** → Happens automatically!

No more manual deployments! 🚀

