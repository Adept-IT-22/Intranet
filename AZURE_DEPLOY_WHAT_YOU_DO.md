# Deploy Intranet to Azure – What You Need to Do

Your app is already set up to deploy to Azure. Follow **one** of the two options below.

---

## Option 1: Azure VM (closest to your current 192.168.1.154 setup)

**You do these steps once, then deploy with a script.**

### 1. Install Azure CLI (if you don’t have it)

- Windows: https://aka.ms/installazurecliwindows or `winget install Microsoft.AzureCLI`
- Then run: `az --version`

### 2. Log in to Azure

```powershell
az login
```

(Browser will open to sign in.)

### 3. Create Azure resources (run in PowerShell)

```powershell
# Variables – change ACR name to something unique (e.g. adeptintranetYOURNAME)
$RESOURCE_GROUP = "adept-intranet-rg"
$LOCATION = "eastus"
$ACR_NAME = "adeptintranetacr"   # must be globally unique, lowercase
$VM_NAME = "adept-intranet-vm"
$VM_USER = "azureuser"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry (ACR)
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic
az acr update --name $ACR_NAME --admin-enabled true

# Create Linux VM
az vm create --resource-group $RESOURCE_GROUP --name $VM_NAME `
  --image "Canonical:0001-com-ubuntu-server-focal:20_04-lts-gen2:latest" `
  --admin-username $VM_USER --generate-ssh-keys --size Standard_B2s --public-ip-sku Standard

# Open ports 80 and 8000
az vm open-port --port 80 --resource-group $RESOURCE_GROUP --name $VM_NAME --priority 1000
az vm open-port --port 8000 --resource-group $RESOURCE_GROUP --name $VM_NAME --priority 1001

# Get the VM public IP and ACR details
$VM_IP = az vm show -d -g $RESOURCE_GROUP -n $VM_NAME --query publicIps -o tsv
$ACR_LOGIN = az acr show --name $ACR_NAME --query loginServer -o tsv
$ACR_USER = az acr credential show --name $ACR_NAME --query username -o tsv
$ACR_PASS = az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv

Write-Host "VM Public IP: $VM_IP"
Write-Host "ACR: $ACR_LOGIN"
Write-Host "Save these for deploy.ps1"
```

**Save:** VM Public IP, ACR login server, ACR username, ACR password.

### 4. Install Docker on the VM

```powershell
ssh ${VM_USER}@${VM_IP} "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo usermod -aG docker $VM_USER"
```

(If SSH asks about host key, type `yes`.)

### 5. Create your deploy script (do not commit passwords)

1. Copy the template: copy `deploy.ps1.template` to `deploy.ps1`.
2. Open `deploy.ps1` and set:
   - `$ACR_REGISTRY` = your ACR login server (e.g. `adeptintranetacr.azurecr.io`)
   - `$ACR_USER` = ACR username
   - `$ACR_PASS` = ACR password
   - `$VM_IP` = VM public IP from step 3
3. Save. (`deploy.ps1` is in `.gitignore` so it won’t be pushed.)

### 6. Deploy the app

From the **project root** (where `deploy.ps1` and `Intranet` are):

```powershell
.\deploy.ps1 -Both -Version v1
```

### 7. Open the app

In the browser: **http://YOUR_VM_IP/Intranet/**  
(Use the VM public IP from step 3.)

---

## Option 2: Azure App Service (Web App for Containers) + GitHub Actions

**You create the Azure resources and GitHub secrets once; then every push to `main` can deploy.**

### 1. Create in Azure

- **Resource group** (e.g. `adept-intranet-rg`).
- **Container Registry** (ACR), admin user enabled.
- **Two Web Apps** (Web App for Containers):
  - One for **frontend** (e.g. `adept-intranet-frontend`).
  - One for **backend** (e.g. `adept-intranet-backend`).
- Configure each Web App to use **Linux** and to pull the correct image from your ACR (e.g. `intranet-frontend:latest`, `intranet-backend:latest`).

### 2. Add GitHub secrets

In GitHub: **Repo → Settings → Secrets and variables → Actions.** Add:

- `ACR_REGISTRY` (e.g. `youracr.azurecr.io`)
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_WEBAPP_NAME_FRONTEND` (frontend app name)
- `AZURE_WEBAPP_NAME_BACKEND` (backend app name)
- `AZURE_RESOURCE_GROUP`
- `AZURE_CREDENTIALS` (Azure service principal JSON for `az login`)

### 3. Deploy

- Push to `main`, or run the **“Deploy to Azure App Service”** workflow from the Actions tab.
- After the run, open the frontend app URL (e.g. `https://adept-intranet-frontend.azurewebsites.net/Intranet/`).

---

## Summary

| Goal                         | What you do |
|-----------------------------|-------------|
| Deploy to an **Azure VM**   | Do Option 1: create RG + ACR + VM, fill `deploy.ps1`, run `.\deploy.ps1 -Both -Version v1`. |
| Deploy to **App Service**   | Do Option 2: create RG + ACR + 2 Web Apps, add GitHub secrets, push to `main` or run the workflow. |
| Use the **existing guides** | Follow step-by-step: `AZURE_SETUP_GUIDE.md` (VM) or `.github/workflows/azure-deploy.yml` (App Service). |

If you tell me which option you want (VM or App Service), I can give you the exact commands for your subscription (e.g. with your chosen names and region).
