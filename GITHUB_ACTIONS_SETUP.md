# 🚀 GitHub Actions Setup - Deploy Directly from GitHub

This guide shows you how to set up automatic deployment from GitHub to Azure - **no Azure CLI needed!**

## ✅ What You Get

- **Automatic deployment** when you push to GitHub
- **No command line** - everything happens automatically
- **Build and deploy** in one workflow
- **Easy updates** - just push code!

## 📋 Prerequisites

1. ✅ Azure account
2. ✅ GitHub repository (you have this: https://github.com/Adept-IT-22/Intranet)
3. ✅ Azure resources created (see `AZURE_PORTAL_SETUP.md`)

## 🔧 Step 1: Create Azure Resources

Follow `AZURE_PORTAL_SETUP.md` to create:
- Resource Group
- Azure Container Registry (ACR)
- App Service Plan
- Backend App Service
- Frontend App Service

## 🔐 Step 2: Set Up GitHub Secrets

1. Go to your repository: https://github.com/Adept-IT-22/Intranet
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

### Required Secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `AZURE_WEBAPP_NAME_BACKEND` | Backend app name | From Azure Portal → Your backend App Service → Overview |
| `AZURE_WEBAPP_NAME_FRONTEND` | Frontend app name | From Azure Portal → Your frontend App Service → Overview |
| `AZURE_RESOURCE_GROUP` | Resource group name | `adept-intranet-rg` (or your name) |
| `ACR_REGISTRY` | ACR login server | From Azure Portal → ACR → Access keys → Login server |
| `ACR_USERNAME` | ACR username | From Azure Portal → ACR → Access keys → Username |
| `ACR_PASSWORD` | ACR password | From Azure Portal → ACR → Access keys → Password |
| `AZURE_CREDENTIALS` | Service principal JSON | See below |

### Get Azure Credentials (AZURE_CREDENTIALS)

**Option A: Using Azure Portal (Easiest)**

1. Go to [Azure Cloud Shell](https://shell.azure.com)
2. Run this command (replace `YOUR_SUBSCRIPTION_ID`):
   ```bash
   az ad sp create-for-rbac --name "github-actions-deploy" \
     --role contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/adept-intranet-rg \
     --sdk-auth
   ```
3. Copy the entire JSON output
4. Add as GitHub secret: `AZURE_CREDENTIALS`

**Option B: Using Azure Portal UI**

1. Go to **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Name: `github-actions-deploy`
4. Click **Register**
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** → **New client secret**
7. Copy the secret value
8. Go to **Subscriptions** → Your subscription → **Access control (IAM)**
9. Click **Add** → **Add role assignment**
10. Role: **Contributor**
11. Assign access to: **User, group, or service principal**
12. Select: `github-actions-deploy`
13. Create JSON manually:
    ```json
    {
      "clientId": "YOUR_APPLICATION_ID",
      "clientSecret": "YOUR_CLIENT_SECRET",
      "subscriptionId": "YOUR_SUBSCRIPTION_ID",
      "tenantId": "YOUR_TENANT_ID"
    }
    ```

## 🎯 Step 3: Verify GitHub Actions Workflow

The workflow file is already in your repo: `.github/workflows/azure-deploy.yml`

It will:
1. ✅ Build Docker images when you push
2. ✅ Push to Azure Container Registry
3. ✅ Deploy to Azure App Service
4. ✅ Run database migrations

## 🚀 Step 4: Deploy!

1. **Make a small change** (or just push existing code)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push
   ```
3. **Watch it deploy:**
   - Go to your repo → **Actions** tab
   - You'll see the workflow running
   - Wait 5-10 minutes for first deployment

## 📊 Monitor Deployment

1. **GitHub Actions Tab:**
   - Go to https://github.com/Adept-IT-22/Intranet/actions
   - Click on the running workflow
   - See real-time logs

2. **Azure Portal:**
   - Go to your App Services
   - Click **Deployment Center** → See deployment history
   - Click **Log stream** → See live logs

## 🔄 How Updates Work

**Every time you push to `main` branch:**
1. GitHub Actions automatically triggers
2. Builds new Docker images
3. Pushes to ACR
4. Deploys to App Service
5. Your app updates automatically!

**Manual Deployment:**
1. Go to **Actions** tab
2. Click **Deploy to Azure App Service**
3. Click **Run workflow**
4. Enter version (optional)
5. Click **Run workflow**

## 🆘 Troubleshooting

### Workflow fails at "Login to ACR"
- ✅ Check `ACR_REGISTRY`, `ACR_USERNAME`, `ACR_PASSWORD` secrets
- ✅ Verify ACR admin user is enabled

### Workflow fails at "Deploy to Azure"
- ✅ Check `AZURE_CREDENTIALS` secret (valid JSON)
- ✅ Verify service principal has Contributor role
- ✅ Check app names match Azure Portal

### App won't start after deployment
- ✅ Check App Service logs: **Log stream**
- ✅ Verify environment variables in App Service
- ✅ Check container logs in **Container settings**

### Images not found
- ✅ Wait for build step to complete
- ✅ Check ACR has the images
- ✅ Verify image names match

## 📝 Quick Reference

**GitHub Secrets Checklist:**
- [ ] `AZURE_WEBAPP_NAME_BACKEND`
- [ ] `AZURE_WEBAPP_NAME_FRONTEND`
- [ ] `AZURE_RESOURCE_GROUP`
- [ ] `ACR_REGISTRY`
- [ ] `ACR_USERNAME`
- [ ] `ACR_PASSWORD`
- [ ] `AZURE_CREDENTIALS`

**Your App URLs:**
- Frontend: `https://adept-intranet-frontend.azurewebsites.net/Intranet/`
- Backend: `https://adept-intranet-backend.azurewebsites.net/api/`

## 🎉 That's It!

Once set up, you just need to:
1. **Code** → Make changes
2. **Commit** → `git commit -m "Update"`
3. **Push** → `git push`
4. **Deploy** → Happens automatically!

No more manual deployment! 🚀

