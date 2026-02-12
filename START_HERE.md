# 🚀 Start Here - Azure Setup & Deployment

## Quick Answer: Can I Link Azure to Cursor?

**No direct link**, but you can deploy from Cursor's terminal using Azure CLI and PowerShell scripts. It's just as easy!

## 📋 Step-by-Step Process

### Part 1: Install Azure CLI (5 minutes)

1. **Open Cursor's terminal** (Terminal → New Terminal)

2. **Install Azure CLI:**
   ```powershell
   winget install -e --id Microsoft.AzureCLI
   ```

3. **Restart Cursor** (to load Azure CLI)

4. **Verify installation:**
   ```powershell
   az --version
   ```

### Part 2: Login to Azure (2 minutes)

1. **In Cursor's terminal, run:**
   ```powershell
   az login
   ```

2. **Browser opens** - Sign in with your Azure account

3. **Verify login:**
   ```powershell
   az account show
   ```

### Part 3: Create Azure Resources (10 minutes)

**Option A: Automated Setup (Recommended)**

1. **Run the setup script:**
   ```powershell
   .\setup-azure.ps1 -ResourceGroupName "adept-intranet-rg" -Location "eastus" -AcrName "adeptintranetacr" -VmName "adept-intranet-vm"
   ```
   
   **Note:** Change `adeptintranetacr` to something unique (ACR names must be globally unique)

2. **Script will:**
   - Create resource group
   - Create Azure Container Registry (ACR)
   - Create Azure VM
   - Install Docker on VM
   - Configure everything
   - Save credentials to `azure-config.txt`

3. **Save the output!** You'll need these credentials.

**Option B: Manual Setup**

Follow the detailed guide in `AZURE_SETUP_GUIDE.md`

### Part 4: Update Deployment Script (2 minutes)

1. **Open `deploy.ps1`** in Cursor

2. **Update these lines** (around line 15-20):
   ```powershell
   $ACR_REGISTRY = "YOUR_ACR.azurecr.io"  # From azure-config.txt
   $ACR_USER = "YOUR_ACR_USERNAME"        # From azure-config.txt
   $ACR_PASS = "YOUR_ACR_PASSWORD"        # From azure-config.txt
   $VM_IP = "YOUR_VM_IP"                  # From azure-config.txt
   ```

3. **Save the file**

### Part 5: Deploy Your App (5 minutes)

1. **In Cursor's terminal, run:**
   ```powershell
   .\deploy.ps1 -Both -Version v16
   ```

2. **Wait for deployment** (builds images, pushes to Azure, deploys to VM)

3. **Access your app:**
   ```
   http://YOUR_VM_IP/Intranet/
   ```

## 🔄 Future Updates

Whenever you make changes:

1. **Edit code in Cursor**
2. **Test locally** (optional)
3. **Deploy from Cursor terminal:**
   ```powershell
   .\deploy.ps1 -Both -Version v17  # Increment version number
   ```

## 📝 What You'll Need

- ✅ Azure account (free tier works)
- ✅ Azure CLI installed
- ✅ Docker installed (you have this)
- ✅ SSH access (handled by Azure)

## 💰 Estimated Costs

- **ACR Basic**: ~$5/month
- **VM (Standard_B2s)**: ~$30-40/month
- **Total**: ~$35-45/month

## 🆘 Need Help?

1. **Setup issues?** → See `AZURE_SETUP_GUIDE.md`
2. **Deployment issues?** → See `AZURE_DEPLOYMENT.md`
3. **Using Cursor?** → See `CURSOR_AZURE_DEPLOY.md`

## ✅ Checklist

- [ ] Azure CLI installed
- [ ] Logged in to Azure (`az login`)
- [ ] Azure resources created (resource group, ACR, VM)
- [ ] `deploy.ps1` updated with credentials
- [ ] First deployment successful
- [ ] App accessible at `http://YOUR_VM_IP/Intranet/`

## 🎯 Next Steps After Setup

1. **Test deployment** - Make a small change and redeploy
2. **Set up monitoring** - Check container logs
3. **Configure backups** - For database (if using one)
4. **Set up CI/CD** - Optional: GitHub Actions (see `.github/workflows/deploy.yml`)

---

**Ready to start?** Begin with Part 1 above! 🚀

