# 🔗 Deploying from Cursor to Azure

## Can Cursor Link to Azure?

**Short answer:** Cursor doesn't have direct Azure integration, but you can deploy from Cursor's terminal using Azure CLI and PowerShell scripts.

## ✅ What You CAN Do in Cursor

1. **Use Azure CLI** - Run Azure commands directly in Cursor's terminal
2. **Run PowerShell Scripts** - Execute `deploy.ps1` from Cursor
3. **Edit and Deploy** - Make changes, then deploy with one command

## 🚀 Setup Process

### Step 1: Install Azure CLI

**Windows:**
```powershell
# In Cursor's terminal (PowerShell):
winget install -e --id Microsoft.AzureCLI

# Or download from:
# https://aka.ms/installazurecliwindows
```

**Verify:**
```powershell
az --version
```

### Step 2: Login to Azure

```powershell
# In Cursor's terminal:
az login
```

This opens a browser for authentication.

### Step 3: Create Azure Resources

**Option A: Use the setup script (Easiest)**
```powershell
# In Cursor's terminal:
.\setup-azure.ps1 -ResourceGroupName "adept-intranet-rg" -Location "eastus" -AcrName "adeptintranetacr" -VmName "adept-intranet-vm"
```

**Option B: Manual setup**
Follow the steps in `AZURE_SETUP_GUIDE.md`

### Step 4: Update deploy.ps1

After setup, update `deploy.ps1` with your credentials:
- ACR login server
- ACR username and password
- VM IP address

### Step 5: Deploy from Cursor

```powershell
# In Cursor's terminal:
.\deploy.ps1 -Both -Version v16
```

## 📝 Workflow Example

1. **Make code changes** in Cursor
2. **Test locally** (optional)
3. **Deploy from Cursor terminal:**
   ```powershell
   .\deploy.ps1 -Both -Version v16
   ```
4. **Done!** Your app is live

## 🔧 Using Azure CLI in Cursor

You can run any Azure CLI command directly in Cursor's terminal:

```powershell
# List resource groups
az group list

# Check VM status
az vm show -d -g adept-intranet-rg -n adept-intranet-vm

# View ACR repositories
az acr repository list --name adeptintranetacr

# SSH to VM
ssh azureuser@YOUR_VM_IP
```

## 🎯 Recommended Workflow

1. **Development**: Code in Cursor
2. **Testing**: Test locally in Cursor
3. **Deployment**: Run `.\deploy.ps1` from Cursor terminal
4. **Verification**: Check logs or test the live app

## 💡 Tips

- **Keep Azure CLI updated**: `az upgrade`
- **Use Azure CLI autocomplete**: `az completion --shell powershell`
- **Save credentials securely**: Don't commit passwords to Git
- **Use environment variables**: For sensitive data (optional)

## 🆘 Troubleshooting

### "az: command not found"
- Install Azure CLI (see Step 1)
- Restart Cursor after installation

### "Not logged in"
- Run `az login` in Cursor's terminal

### "Permission denied" on SSH
- Check SSH keys are set up: `az vm show -d -g RESOURCE_GROUP -n VM_NAME --query "osProfile.sshPublicKeys"`

## 📚 Additional Resources

- Azure CLI Docs: https://docs.microsoft.com/cli/azure/
- Azure Portal: https://portal.azure.com
- Full Setup Guide: `AZURE_SETUP_GUIDE.md`

