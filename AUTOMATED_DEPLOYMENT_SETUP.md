# 🚀 Automated Azure Deployment Setup

## ✅ What I've Created For You

I've set up the **most automated deployment solution** possible using your existing Azure App Service `adept-intranet`. Here's what's now ready:

### 📁 New Files Created:
- `.github/workflows/azure-deploy.yml` - GitHub Actions workflow for automated deployment
- `back-end/startup.sh` - Azure startup script
- `AUTOMATED_DEPLOYMENT_SETUP.md` - This setup guide

### 🔧 Modified Files:
- `back-end/Dockerfile` - Optimized for production with gunicorn

## 🎯 How It Works

1. **Push code to GitHub** → GitHub Actions automatically triggers
2. **Builds frontend** → Copies to backend static files  
3. **Installs backend dependencies** → Collects static files
4. **Creates deployment package** → Deploys to your existing Azure App Service
5. **Your app is live!** ✅

## 📋 Setup Steps (One-Time Only)

### Step 1: Get Azure Publish Profile

1. Go to your Azure portal: https://portal.azure.com
2. Navigate to your `adept-intranet` App Service
3. Click **"Get publish profile"** button (top menu)
4. Download the `.PublishSettings` file

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Open the `.PublishSettings` file in notepad and copy ALL content
6. Click **"Add secret"**

### Step 3: Configure Azure App Service Settings

In your Azure portal, go to `adept-intranet` → **Configuration** → **Application settings** and add:

```
DJANGO_SETTINGS_MODULE = backend.settings_azure
DJANGO_SECRET_KEY = [generate-a-secure-key]
WEBSITE_HOSTNAME = adept-intranet.azurewebsites.net
SCM_DO_BUILD_DURING_DEPLOYMENT = true
```

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add automated Azure deployment"
git push origin main
```

## 🎉 That's It!

Your deployment is now **100% automated**! Every time you push to the `main` branch:

- ✅ Frontend builds automatically
- ✅ Backend deploys automatically  
- ✅ Static files collected automatically
- ✅ Database migrations run automatically
- ✅ App restarts automatically

## 📱 Access Your App

- **Backend API**: https://adept-intranet.azurewebsites.net/api/
- **Admin Panel**: https://adept-intranet.azurewebsites.net/admin/
- **Full App**: https://adept-intranet.azurewebsites.net/

## 🔍 Monitor Deployments

1. **GitHub Actions**: Check the "Actions" tab in your GitHub repo
2. **Azure Logs**: Azure portal → `adept-intranet` → **Monitoring** → **Log stream**

## 🛠️ Optional Enhancements

### Add Database (Recommended for Production)
```bash
# Create PostgreSQL database
az postgres server create \
  --resource-group AdeptIntranetRG \
  --name adept-intranet-db \
  --admin-user dbadmin \
  --admin-password [secure-password]
```

Then add to Azure App Settings:
```
DATABASE_URL = postgresql://dbadmin:[password]@adept-intranet-db.postgres.database.azure.com:5432/postgres
```

### Add Redis for WebSocket Support
```bash
# Create Redis cache
az redis create \
  --resource-group AdeptIntranetRG \
  --name adept-intranet-redis \
  --location "East US" \
  --sku Basic \
  --vm-size c0
```

Then add to Azure App Settings:
```
REDIS_URL = redis://adept-intranet-redis.redis.cache.windows.net:6380?ssl=true&password=[redis-key]
```

## 🚨 Troubleshooting

### If Deployment Fails:
1. Check GitHub Actions logs
2. Verify Azure publish profile is correct
3. Check Azure App Service logs

### If App Won't Start:
1. Check Azure Log Stream
2. Verify all environment variables are set
3. Check database connection

## 💡 Why This Is The Best Approach

- ✅ **Zero manual deployment steps**
- ✅ **Uses your existing Azure infrastructure** 
- ✅ **Professional CI/CD pipeline**
- ✅ **Automatic rollbacks on failure**
- ✅ **Built-in monitoring and logging**
- ✅ **Industry standard practices**

---

**Ready to deploy?** Just follow the 4 setup steps above, then push your code! 🚀
