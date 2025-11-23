# ⚡ Quick Start - Deploy from GitHub

## 🎯 Goal
Set up automatic deployment from GitHub to Azure - **no Azure CLI needed!**

## 📋 3 Simple Steps

### Step 1: Create Azure Resources (15 minutes)

Follow the guide: **`AZURE_PORTAL_SETUP.md`**

You'll create:
- ✅ Resource Group
- ✅ Azure Container Registry (ACR)
- ✅ App Service Plan
- ✅ Backend App Service
- ✅ Frontend App Service

### Step 2: Add GitHub Secrets (5 minutes)

1. Go to: https://github.com/Adept-IT-22/Intranet/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these 7 secrets (get values from Azure Portal):

   ```
   AZURE_WEBAPP_NAME_BACKEND = adept-intranet-backend
   AZURE_WEBAPP_NAME_FRONTEND = adept-intranet-frontend
   AZURE_RESOURCE_GROUP = adept-intranet-rg
   ACR_REGISTRY = adeptintranetacr.azurecr.io
   ACR_USERNAME = (from ACR Access keys)
   ACR_PASSWORD = (from ACR Access keys)
   AZURE_CREDENTIALS = (see GITHUB_ACTIONS_SETUP.md)
   ```

### Step 3: Push and Deploy! (Automatic)

```bash
git add .
git commit -m "Initial deployment"
git push
```

**That's it!** GitHub Actions will automatically:
- ✅ Build Docker images
- ✅ Push to Azure Container Registry
- ✅ Deploy to Azure App Service
- ✅ Your app goes live!

## 📊 Check Deployment

1. **GitHub Actions**: https://github.com/Adept-IT-22/Intranet/actions
2. **Your App**: `https://adept-intranet-frontend.azurewebsites.net/Intranet/`

## 🔄 Future Updates

Just push code - deployment happens automatically!

```bash
git add .
git commit -m "Update feature"
git push
```

## 📚 Detailed Guides

- **Azure Setup**: `AZURE_PORTAL_SETUP.md`
- **GitHub Secrets**: `GITHUB_ACTIONS_SETUP.md`
- **Troubleshooting**: Check workflow logs in GitHub Actions

## 💰 Cost

~$18/month (Basic) or ~$60/month (Standard)

## ✅ Checklist

- [ ] Azure resources created
- [ ] GitHub secrets added
- [ ] Code pushed to GitHub
- [ ] Deployment successful
- [ ] App accessible

---

**Need help?** Check the detailed guides above! 🚀

