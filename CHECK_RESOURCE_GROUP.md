# 🔍 How to View Your Azure Resource Group

## Navigate to Resource Group

1. **In Azure Portal**, click the **hamburger menu** (☰) on the top left
2. Click **"Resource groups"** (or search for it)
3. Click on your resource group name (e.g., `intranet-rg` or `adept-intranet-rg`)

## What You Should See

### If Resource Group is Empty (New Setup)

You'll see:
- **"No resources found"** message
- **"+ Create"** button

**This means you need to create resources!**

### If Resources Already Exist

You should see a list of resources like:

1. **Azure Container Registry (ACR)**
   - Name: `adeptintranetacr` (or similar)
   - Type: Container registry

2. **App Service Plan**
   - Name: `adept-intranet-plan` (or similar)
   - Type: App Service plan

3. **App Service (Backend)**
   - Name: `adept-intranet-backend` (or similar)
   - Type: App Service

4. **App Service (Frontend)**
   - Name: `adept-intranet-frontend` (or similar)
   - Type: App Service

## 📋 Quick Checklist

Check if you have these resources:

- [ ] **Resource Group** - Container for all resources
- [ ] **Azure Container Registry (ACR)** - Stores Docker images
- [ ] **App Service Plan** - Hosting plan
- [ ] **Backend App Service** - Runs your Django backend
- [ ] **Frontend App Service** - Runs your React frontend

## 🚀 Next Steps

### If Resource Group is Empty:

Follow **`AZURE_PORTAL_SETUP.md`** to create all resources step by step.

### If Resources Exist:

1. Check each resource is running
2. Get credentials for GitHub Secrets
3. Set up GitHub Actions

## 🔍 View Resource Details

Click on any resource to see:
- **Overview** - Status, URL, configuration
- **Configuration** - Settings, environment variables
- **Deployment Center** - GitHub integration
- **Logs** - Application logs

## 💡 Tips

- Use the **search bar** at the top to find resources quickly
- Click **"Refresh"** if resources don't appear
- Check **"All resources"** if you can't find your resource group

