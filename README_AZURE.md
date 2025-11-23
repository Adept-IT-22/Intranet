# 🚀 Azure Deployment - Complete Guide

## Quick Start

**New to Azure?** → Start with `START_HERE.md`

**Already have Azure resources?** → Update `deploy.ps1` and deploy!

## 📚 Documentation Files

1. **`START_HERE.md`** ⭐ - **Start here!** Step-by-step setup guide
2. **`AZURE_SETUP_GUIDE.md`** - Detailed Azure resource setup
3. **`setup-azure.ps1`** - Automated Azure setup script
4. **`CURSOR_AZURE_DEPLOY.md`** - How to deploy from Cursor
5. **`AZURE_DEPLOYMENT.md`** - Complete deployment guide
6. **`QUICK_UPDATE.md`** - Quick update reference
7. **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment checklist

## 🎯 Two Ways to Set Up

### Option 1: Automated (Recommended)

```powershell
# 1. Install Azure CLI
winget install -e --id Microsoft.AzureCLI

# 2. Login
az login

# 3. Run setup script
.\setup-azure.ps1 -ResourceGroupName "adept-intranet-rg" -Location "eastus" -AcrName "adeptintranetacr" -VmName "adept-intranet-vm"

# 4. Update deploy.ps1 with credentials from azure-config.txt

# 5. Deploy!
.\deploy.ps1 -Both -Version v16
```

### Option 2: Manual Setup

Follow `AZURE_SETUP_GUIDE.md` for step-by-step manual setup.

## 🔄 Deploying Updates

Once set up, deploying updates is simple:

```powershell
.\deploy.ps1 -Both -Version v17  # Increment version number
```

## 💰 Costs

- **ACR Basic**: ~$5/month
- **VM Standard_B2s**: ~$30-40/month
- **Total**: ~$35-45/month

## 🔐 Security

- Credentials saved in `azure-config.txt` (not in Git)
- SSH keys for VM access
- ACR admin user enabled (can use Managed Identity for production)

## 🆘 Troubleshooting

### Can't SSH to VM
```powershell
# Check VM is running
az vm show -d -g RESOURCE_GROUP -n VM_NAME

# Get VM IP
az vm show -d -g RESOURCE_GROUP -n VM_NAME --query publicIps -o tsv
```

### Can't push to ACR
```powershell
# Login to ACR
az acr login --name YOUR_ACR_NAME

# Or with credentials
docker login YOUR_ACR.azurecr.io -u USERNAME -p PASSWORD
```

### Containers won't start
```powershell
# SSH to VM and check
ssh azureuser@VM_IP "docker ps -a"
ssh azureuser@VM_IP "docker logs intranet-backend"
```

## 📞 Need Help?

1. Check `START_HERE.md` for step-by-step guide
2. Check `AZURE_SETUP_GUIDE.md` for detailed setup
3. Check container logs for errors
4. Verify all credentials are correct

