# 🏗️ Azure Portal Setup Guide (No CLI Required)

This guide shows you how to set up Azure resources using the Azure Portal web interface - no command line needed!

## 🎯 Recommended Architecture

**Azure App Service for Containers** (Best Option)
- ✅ Automatic scaling
- ✅ Built-in CI/CD with GitHub
- ✅ Managed service (no server management)
- ✅ Supports WebSockets
- ✅ Easy to set up
- ✅ Cost-effective (~$13-55/month)

## 📋 Step-by-Step Setup

### Step 1: Create Resource Group

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Resource group"**
4. Click **Create**
5. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `adept-intranet-rg`
   - **Region**: Choose closest to you (e.g., `East US`)
6. Click **Review + create** → **Create**

### Step 2: Create Azure Container Registry (ACR)

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Container Registry"**
3. Click **Create**
4. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `adept-intranet-rg` (from Step 1)
   - **Registry name**: `adeptintranetacr` (must be globally unique, lowercase, 5-50 chars)
   - **Location**: Same as resource group
   - **SKU**: **Basic** ($5/month)
5. Click **Review + create** → **Create**
6. Wait for deployment (2-3 minutes)

**Get ACR Credentials:**
1. Go to your Container Registry
2. Click **Access keys** in left menu
3. Enable **Admin user** (toggle switch)
4. Copy:
   - **Login server** (e.g., `adeptintranetacr.azurecr.io`)
   - **Username** (usually same as registry name)
   - **Password** (copy password1 or password2)

### Step 3: Create App Service Plan

1. Click **"Create a resource"**
2. Search for **"App Service Plan"**
3. Click **Create**
4. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `adept-intranet-rg`
   - **Name**: `adept-intranet-plan`
   - **Operating System**: **Linux**
   - **Region**: Same as resource group
   - **Pricing tier**: **Basic B1** ($13/month) or **Standard S1** ($55/month for better performance)
5. Click **Review + create** → **Create**

### Step 4: Create Backend App Service

1. Click **"Create a resource"**
2. Search for **"Web App"**
3. Click **Create**
4. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `adept-intranet-rg`
   - **Name**: `adept-intranet-backend` (must be globally unique)
   - **Publish**: **Container**
   - **Operating System**: **Linux**
   - **Region**: Same as resource group
   - **App Service Plan**: Select `adept-intranet-plan` (from Step 3)
5. Click **Next: Docker**
6. Configure Docker:
   - **Options**: **Single Container**
   - **Image Source**: **Azure Container Registry**
   - **Registry**: Select your ACR (`adeptintranetacr`)
   - **Image**: `intranet-backend`
   - **Tag**: `latest`
7. Click **Review + create** → **Create**

**Configure Backend Settings:**
1. Go to your backend App Service
2. Click **Configuration** → **Application settings**
3. Add these settings:
   - `ALLOWED_HOSTS` = `adept-intranet-backend.azurewebsites.net,localhost,127.0.0.1`
   - `DEBUG` = `False`
   - `REDIS_HOST` = (if using Redis)
   - `REDIS_PORT` = `6379` (if using Redis)
4. Click **Save**

### Step 5: Create Frontend App Service

1. Click **"Create a resource"**
2. Search for **"Web App"**
3. Click **Create**
4. Fill in:
   - **Subscription**: Your subscription
   - **Resource group**: `adept-intranet-rg`
   - **Name**: `adept-intranet-frontend` (must be globally unique)
   - **Publish**: **Container**
   - **Operating System**: **Linux**
   - **Region**: Same as resource group
   - **App Service Plan**: Select `adept-intranet-plan` (from Step 3)
5. Click **Next: Docker**
6. Configure Docker:
   - **Options**: **Single Container**
   - **Image Source**: **Azure Container Registry**
   - **Registry**: Select your ACR (`adeptintranetacr`)
   - **Image**: `intranet-frontend`
   - **Tag**: `latest`
7. Click **Review + create** → **Create**

### Step 6: Configure Frontend to Connect to Backend

1. Go to your frontend App Service
2. Click **Configuration** → **Application settings**
3. Add:
   - `BACKEND_URL` = `https://adept-intranet-backend.azurewebsites.net`
4. Click **Save**

**Update nginx.conf** (if needed):
- Make sure frontend nginx proxies `/api/` to backend URL

### Step 7: Set Up GitHub Secrets

1. Go to your GitHub repository: https://github.com/Adept-IT-22/Intranet
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   - **Name**: `AZURE_WEBAPP_NAME_BACKEND`
     **Value**: `adept-intranet-backend`

   - **Name**: `AZURE_WEBAPP_NAME_FRONTEND`
     **Value**: `adept-intranet-frontend`

   - **Name**: `AZURE_RESOURCE_GROUP`
     **Value**: `adept-intranet-rg`

   - **Name**: `ACR_REGISTRY`
     **Value**: `adeptintranetacr.azurecr.io` (your ACR login server)

   - **Name**: `ACR_USERNAME`
     **Value**: Your ACR username (from Step 2)

   - **Name**: `ACR_PASSWORD`
     **Value**: Your ACR password (from Step 2)

   - **Name**: `AZURE_CREDENTIALS`
     **Value**: (See below for how to get this)

### Step 8: Get Azure Credentials for GitHub Actions

1. In Azure Portal, click **Azure Active Directory**
2. Click **App registrations** → **New registration**
3. Fill in:
   - **Name**: `github-actions-deploy`
   - **Supported account types**: **Single tenant**
4. Click **Register**
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Click **Certificates & secrets** → **New client secret**
7. Add description: `GitHub Actions`
8. Click **Add**
9. **Copy the secret value** (you won't see it again!)

**Create Service Principal:**
1. Open [Azure Cloud Shell](https://shell.azure.com) (or install Azure CLI locally)
2. Run:
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" \
     --role contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/adept-intranet-rg \
     --sdk-auth
   ```
3. Copy the JSON output

**Add to GitHub Secrets:**
- **Name**: `AZURE_CREDENTIALS`
- **Value**: Paste the JSON from above

### Step 9: Enable Continuous Deployment

1. Go to your **Backend App Service**
2. Click **Deployment Center**
3. Select **GitHub Actions**
4. Authorize Azure to access GitHub
5. Select:
   - **Organization**: `Adept-IT-22`
   - **Repository**: `Intranet`
   - **Branch**: `main`
6. Click **Save**

Repeat for **Frontend App Service**

## ✅ Verify Setup

1. **Push to GitHub** - Any push to `main` branch will trigger deployment
2. **Check GitHub Actions** - Go to your repo → **Actions** tab
3. **View Logs** - Click on the running workflow to see progress
4. **Access App** - `https://adept-intranet-frontend.azurewebsites.net/Intranet/`

## 🔄 How It Works

1. **You push code to GitHub** → Triggers GitHub Actions
2. **GitHub Actions builds Docker images** → Pushes to ACR
3. **GitHub Actions deploys to App Service** → Pulls from ACR
4. **App Service runs your containers** → Your app is live!

## 💰 Cost Estimate

- **Resource Group**: Free
- **ACR Basic**: ~$5/month
- **App Service Plan Basic B1**: ~$13/month
- **Total**: ~$18/month (Basic) or ~$60/month (Standard)

## 🆘 Troubleshooting

### Deployment fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Check ACR credentials

### App won't start
- Check App Service logs: **Log stream** in Azure Portal
- Verify environment variables
- Check container logs

### Can't access app
- Check **Custom domains** settings
- Verify **CORS** settings in backend
- Check **ALLOWED_HOSTS** environment variable

## 📝 Next Steps

1. Complete the setup above
2. Push code to GitHub
3. Watch it deploy automatically!
4. Access your app at the App Service URL

