# 🚀 Create Azure Resources - Step by Step

Your resource group `intranet-rg` is empty. Let's create all the resources you need!

## 📋 What We'll Create

1. ✅ Azure Container Registry (ACR) - Stores Docker images
2. ✅ App Service Plan - Hosting plan
3. ✅ Backend App Service - Runs your Django backend
4. ✅ Frontend App Service - Runs your React frontend

---

## Step 1: Create Azure Container Registry (ACR)

1. **In your resource group page**, click the **"+ Create"** button (top left)

2. **Search for**: `Container Registry`

3. **Click** on "Container Registry" from Microsoft

4. **Click "Create"**

5. **Fill in the form:**
   - **Subscription**: Your subscription (should be pre-filled)
   - **Resource group**: `intranet-rg` (should be pre-filled)
   - **Registry name**: `adeptintranetacr` 
     - ⚠️ **Must be globally unique!** If taken, try: `adeptintranetacr2` or add numbers
   - **Location**: Choose closest to you (e.g., `East US`, `West Europe`)
   - **SKU**: **Basic** ($5/month)
   - **Admin user**: **Enable** (toggle ON)

6. **Click "Review + create"** → **"Create"**

7. **Wait 2-3 minutes** for deployment

8. **After deployment**, click **"Go to resource"**

9. **Get ACR Credentials:**
   - Click **"Access keys"** in left menu
   - **Copy these values** (you'll need them for GitHub Secrets):
     - **Login server**: `adeptintranetacr.azurecr.io`
     - **Username**: (usually same as registry name)
     - **Password**: Copy **password1** or **password2**

---

## Step 2: Create App Service Plan

1. **Go back to your resource group** (`intranet-rg`)

2. **Click "+ Create"**

3. **Search for**: `App Service Plan`

4. **Click "Create"**

5. **Fill in:**
   - **Subscription**: Your subscription
   - **Resource group**: `intranet-rg`
   - **Name**: `adept-intranet-plan`
   - **Operating System**: **Linux** ⚠️ Important!
   - **Region**: Same as ACR (e.g., `East US`)
   - **Pricing tier**: 
     - **Basic B1** ($13/month) - For testing
     - **Standard S1** ($55/month) - For production (better performance)

6. **Click "Review + create"** → **"Create"**

7. **Wait 1-2 minutes**

---

## Step 3: Create Backend App Service

1. **Go back to resource group** (`intranet-rg`)

2. **Click "+ Create"**

3. **Search for**: `Web App`

4. **Click "Create"**

5. **Basics Tab:**
   - **Subscription**: Your subscription
   - **Resource group**: `intranet-rg`
   - **Name**: `adept-intranet-backend`
     - ⚠️ **Must be globally unique!** If taken, add numbers
   - **Publish**: **Container**
   - **Operating System**: **Linux**
   - **Region**: Same as before
   - **App Service Plan**: Select `adept-intranet-plan` (from Step 2)

6. **Click "Next: Docker"**

7. **Docker Tab:**
   - **Options**: **Single Container**
   - **Image Source**: **Azure Container Registry**
   - **Registry**: Select `adeptintranetacr` (from Step 1)
   - **Image**: `intranet-backend`
   - **Tag**: `latest`

8. **Click "Review + create"** → **"Create"**

9. **Wait 2-3 minutes**

10. **After deployment**, click **"Go to resource"**

11. **Configure Backend Settings:**
    - Click **"Configuration"** in left menu
    - Click **"Application settings"** tab
    - Click **"+ New application setting"**
    - Add these settings one by one:
    
      | Name | Value |
      |------|-------|
      | `ALLOWED_HOSTS` | `adept-intranet-backend.azurewebsites.net,localhost,127.0.0.1` |
      | `DEBUG` | `False` |
    
    - Click **"Save"** after adding each setting

---

## Step 4: Create Frontend App Service

1. **Go back to resource group** (`intranet-rg`)

2. **Click "+ Create"**

3. **Search for**: `Web App`

4. **Click "Create"**

5. **Basics Tab:**
   - **Subscription**: Your subscription
   - **Resource group**: `intranet-rg`
   - **Name**: `adept-intranet-frontend`
     - ⚠️ **Must be globally unique!**
   - **Publish**: **Container**
   - **Operating System**: **Linux**
   - **Region**: Same as before
   - **App Service Plan**: Select `adept-intranet-plan` (same plan as backend)

6. **Click "Next: Docker"**

7. **Docker Tab:**
   - **Options**: **Single Container**
   - **Image Source**: **Azure Container Registry**
   - **Registry**: Select `adeptintranetacr`
   - **Image**: `intranet-frontend`
   - **Tag**: `latest`

8. **Click "Review + create"** → **"Create"**

9. **Wait 2-3 minutes**

10. **After deployment**, click **"Go to resource"**

11. **Configure Frontend Settings:**
    - Click **"Configuration"** → **"Application settings"**
    - Add:
      - **Name**: `BACKEND_URL`
      - **Value**: `https://adept-intranet-backend.azurewebsites.net`
    - Click **"Save"**

---

## ✅ Verify All Resources

Go back to your resource group (`intranet-rg`). You should now see:

- ✅ **Container Registry** (`adeptintranetacr`)
- ✅ **App Service Plan** (`adept-intranet-plan`)
- ✅ **App Service** (`adept-intranet-backend`)
- ✅ **App Service** (`adept-intranet-frontend`)

---

## 🔐 Next: Set Up GitHub Secrets

Once all resources are created, follow **`GITHUB_ACTIONS_SETUP.md`** to:
1. Add GitHub Secrets
2. Configure automatic deployment
3. Push code and watch it deploy!

---

## 💡 Tips

- **Names must be unique**: If a name is taken, add numbers (e.g., `adeptintranetacr2`)
- **Wait for deployments**: Each resource takes 2-3 minutes
- **Save credentials**: Copy ACR credentials - you'll need them for GitHub
- **Check resource group**: Refresh the page to see new resources

---

## 🆘 Troubleshooting

**"Name already exists"**
- Try adding numbers: `adeptintranetacr2`, `adeptintranetacr3`

**Can't find resource after creation**
- Click "Refresh" in resource group
- Check "All resources" in Azure Portal

**Deployment failed**
- Check the error message
- Try creating again with a different name

---

**Ready? Start with Step 1!** 🚀

