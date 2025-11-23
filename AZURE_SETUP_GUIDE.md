# 🏗️ Azure Setup Guide - Step by Step

This guide will help you set up Azure resources from scratch and deploy your application.

## 📋 Prerequisites

1. **Azure Account** - Sign up at https://azure.microsoft.com/
2. **Azure CLI** - Install from https://docs.microsoft.com/cli/azure/install-azure-cli
3. **Docker** - Already installed on your machine
4. **SSH Access** - For VM deployment

## 🚀 Step-by-Step Azure Setup

### Step 1: Install Azure CLI (if not installed)

**Windows (PowerShell):**
```powershell
# Download and install from:
# https://aka.ms/installazurecliwindows
# Or use winget:
winget install -e --id Microsoft.AzureCLI
```

**Verify installation:**
```powershell
az --version
```

### Step 2: Login to Azure

```powershell
az login
```

This will open a browser window for authentication.

### Step 3: Create Resource Group

```powershell
# Set variables
$RESOURCE_GROUP = "adept-intranet-rg"
$LOCATION = "eastus"  # Change to your preferred region

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Step 4: Create Azure Container Registry (ACR)

```powershell
# Set ACR name (must be globally unique, lowercase, alphanumeric)
$ACR_NAME = "adeptintranetacr"  # Change this to something unique

# Create ACR
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# Get ACR login server
az acr show --name $ACR_NAME --query loginServer --output tsv

# Enable admin user (for Docker login)
az acr update --name $ACR_NAME --admin-enabled true

# Get admin credentials
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv
$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv

Write-Host "ACR Login Server: $ACR_LOGIN_SERVER"
Write-Host "ACR Username: $ACR_USERNAME"
Write-Host "ACR Password: $ACR_PASSWORD"
```

**Save these credentials!** You'll need them for deployment.

### Step 5: Create Azure VM (Linux)

```powershell
# Set VM variables
$VM_NAME = "adept-intranet-vm"
$VM_USER = "azureuser"
$VM_SIZE = "Standard_B2s"  # 2 vCPUs, 4GB RAM (adjust as needed)

# Create VM with Docker pre-installed
az vm create `
  --resource-group $RESOURCE_GROUP `
  --name $VM_NAME `
  --image "Canonical:0001-com-ubuntu-server-focal:20_04-lts-gen2:latest" `
  --admin-username $VM_USER `
  --generate-ssh-keys `
  --size $VM_SIZE `
  --public-ip-sku Standard

# Get VM public IP
$VM_IP = az vm show -d -g $RESOURCE_GROUP -n $VM_NAME --query publicIps -o tsv
Write-Host "VM Public IP: $VM_IP"

# Open port 80 (HTTP)
az vm open-port --port 80 --resource-group $RESOURCE_GROUP --name $VM_NAME --priority 1000

# Open port 8000 (Backend API - optional, can be internal only)
az vm open-port --port 8000 --resource-group $RESOURCE_GROUP --name $VM_NAME --priority 1001
```

### Step 6: Install Docker on VM

```powershell
# SSH into VM and install Docker
ssh $VM_USER@$VM_IP "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo usermod -aG docker $VM_USER && newgrp docker"
```

**Note:** You may need to log out and back in for Docker group changes to take effect.

### Step 7: Configure ACR Access on VM

```powershell
# Login to ACR from VM
ssh $VM_USER@$VM_IP "docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD"
```

### Step 8: Update Deployment Script

Update `deploy.ps1` with your new credentials:

```powershell
# Edit deploy.ps1 and update these values:
$ACR_REGISTRY = "YOUR_ACR_LOGIN_SERVER"  # e.g., adeptintranetacr.azurecr.io
$ACR_USER = "YOUR_ACR_USERNAME"
$ACR_PASS = "YOUR_ACR_PASSWORD"
$VM_IP = "YOUR_VM_PUBLIC_IP"
```

## 🚀 Deployment from Local Machine

### Option 1: Using PowerShell Script (Recommended)

```powershell
# Update deploy.ps1 with your credentials first, then:
.\deploy.ps1 -Both -Version v16
```

### Option 2: Using Azure CLI

You can also deploy directly using Azure CLI commands from Cursor's terminal.

### Option 3: Manual Docker Commands

```powershell
# 1. Login to ACR
docker login YOUR_ACR.azurecr.io -u YOUR_USERNAME -p YOUR_PASSWORD

# 2. Build and push
docker build -f Dockerfile.nginx -t YOUR_ACR.azurecr.io/intranet-frontend:v16 .
docker push YOUR_ACR.azurecr.io/intranet-frontend:v16

docker build -f Intranet/back-end/Dockerfile -t YOUR_ACR.azurecr.io/intranet-backend:v16 Intranet/back-end/
docker push YOUR_ACR.azurecr.io/intranet-backend:v16

# 3. Deploy to VM
ssh azureuser@YOUR_VM_IP "docker pull YOUR_ACR.azurecr.io/intranet-frontend:v16 && docker run -d --name intranet-frontend -p 80:80 YOUR_ACR.azurecr.io/intranet-frontend:v16"
```

## 🔗 Linking Azure to Cursor

**Cursor doesn't have direct Azure integration**, but you can:

1. **Use Azure CLI in Cursor's terminal** - Install Azure CLI and use it directly
2. **Use PowerShell scripts** - Run `deploy.ps1` from Cursor's terminal
3. **Use VS Code Azure extension** - If you have VS Code, install Azure extension
4. **Use GitHub Actions** - Set up CI/CD that deploys automatically

## 📝 Quick Setup Script

I'll create a setup script that does all of this automatically. See `setup-azure.ps1`

## ✅ Verification

After setup, verify everything works:

```powershell
# Check ACR
az acr repository list --name $ACR_NAME --output table

# Check VM
az vm show -d -g $RESOURCE_GROUP -n $VM_NAME --query "powerState" -o tsv

# Test SSH
ssh $VM_USER@$VM_IP "docker --version"
```

## 🔐 Security Best Practices

1. **Use Azure Key Vault** for storing passwords (optional)
2. **Use Managed Identity** instead of passwords (advanced)
3. **Restrict VM ports** - Only open necessary ports
4. **Use SSH keys** - Already configured in Step 5
5. **Regular updates** - Keep VM and Docker updated

## 💰 Cost Estimation

- **Resource Group**: Free
- **ACR Basic**: ~$5/month
- **VM Standard_B2s**: ~$30-40/month
- **Total**: ~$35-45/month

## 🆘 Troubleshooting

### Can't SSH to VM
- Check Network Security Group (NSG) rules
- Verify SSH key is correct
- Check VM is running: `az vm show -d -g $RESOURCE_GROUP -n $VM_NAME`

### Can't push to ACR
- Verify credentials: `az acr credential show --name $ACR_NAME`
- Check you're logged in: `az acr login --name $ACR_NAME`

### Containers won't start
- Check Docker is installed: `ssh user@vm "docker --version"`
- Check logs: `ssh user@vm "docker logs container-name"`

## 📞 Next Steps

1. Complete the setup steps above
2. Update `deploy.ps1` with your credentials
3. Test deployment: `.\deploy.ps1 -Both -Version v16`
4. Access your app: `http://YOUR_VM_IP/Intranet/`

