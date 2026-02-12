# Azure Setup Script for Adept Intranet
# This script creates all necessary Azure resources

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "adept-intranet-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$true)]
    [string]$AcrName = "adeptintranetacr",  # Must be globally unique, lowercase, 5-50 chars
    
    [Parameter(Mandatory=$true)]
    [string]$VmName = "adept-intranet-vm",
    
    [Parameter(Mandatory=$false)]
    [string]$VmSize = "Standard_B2s"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "🏗️  Azure Setup Script for Adept Intranet" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if Azure CLI is installed
Write-Info "Checking Azure CLI installation..."
try {
    $azVersion = az --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI not found"
    }
    Write-Success "Azure CLI is installed"
} catch {
    Write-Error "Azure CLI is not installed. Please install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
}

# Check if logged in
Write-Info "Checking Azure login status..."
try {
    $account = az account show 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Not logged in to Azure. Opening browser for login..."
        az login
    }
    Write-Success "Logged in to Azure"
} catch {
    Write-Error "Failed to login to Azure"
    exit 1
}

# Step 1: Create Resource Group
Write-Info "=========================================="
Write-Info "Step 1: Creating Resource Group"
Write-Info "=========================================="
Write-Info "Resource Group: $ResourceGroupName"
Write-Info "Location: $Location"

az group create --name $ResourceGroupName --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create resource group"
    exit 1
}
Write-Success "Resource group created"

# Step 2: Create Azure Container Registry
Write-Info "=========================================="
Write-Info "Step 2: Creating Azure Container Registry"
Write-Info "=========================================="
Write-Info "ACR Name: $AcrName"

az acr create --resource-group $ResourceGroupName --name $AcrName --sku Basic
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create ACR. Name might already be taken. Try a different name."
    exit 1
}
Write-Success "ACR created"

# Enable admin user
az acr update --name $AcrName --admin-enabled true

# Get ACR credentials
$acrLoginServer = az acr show --name $AcrName --query loginServer --output tsv
$acrUsername = az acr credential show --name $AcrName --query username --output tsv
$acrPassword = az acr credential show --name $AcrName --query "passwords[0].value" --output tsv

Write-Success "ACR credentials retrieved"

# Step 3: Create VM
Write-Info "=========================================="
Write-Info "Step 3: Creating Azure VM"
Write-Info "=========================================="
Write-Info "VM Name: $VmName"
Write-Info "VM Size: $VmSize"

az vm create `
  --resource-group $ResourceGroupName `
  --name $VmName `
  --image "Canonical:0001-com-ubuntu-server-focal:20_04-lts-gen2:latest" `
  --admin-username azureuser `
  --generate-ssh-keys `
  --size $VmSize `
  --public-ip-sku Standard

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create VM"
    exit 1
}
Write-Success "VM created"

# Get VM IP
$vmIp = az vm show -d -g $ResourceGroupName -n $VmName --query publicIps -o tsv
Write-Success "VM Public IP: $vmIp"

# Step 4: Open ports
Write-Info "=========================================="
Write-Info "Step 4: Opening Firewall Ports"
Write-Info "=========================================="

az vm open-port --port 80 --resource-group $ResourceGroupName --name $VmName --priority 1000
az vm open-port --port 8000 --resource-group $ResourceGroupName --name $VmName --priority 1001
Write-Success "Ports 80 and 8000 opened"

# Step 5: Install Docker on VM
Write-Info "=========================================="
Write-Info "Step 5: Installing Docker on VM"
Write-Info "=========================================="
Write-Warning "This may take a few minutes..."

$dockerInstallCmd = @"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker azureuser
sudo systemctl enable docker
sudo systemctl start docker
"@

ssh -o StrictHostKeyChecking=no azureuser@$vmIp $dockerInstallCmd
if ($LASTEXITCODE -eq 0) {
    Write-Success "Docker installed on VM"
} else {
    Write-Warning "Docker installation may have issues. You may need to SSH and install manually."
}

# Step 6: Login to ACR from VM
Write-Info "=========================================="
Write-Info "Step 6: Configuring ACR Access on VM"
Write-Info "=========================================="

ssh -o StrictHostKeyChecking=no azureuser@$vmIp "echo '$acrPassword' | docker login $acrLoginServer -u $acrUsername --password-stdin"
if ($LASTEXITCODE -eq 0) {
    Write-Success "VM can access ACR"
} else {
    Write-Warning "ACR login from VM failed. You may need to configure it manually."
}

# Step 7: Create configuration file
Write-Info "=========================================="
Write-Info "Step 7: Creating Configuration File"
Write-Info "=========================================="

$configContent = @"
# Azure Configuration
# Generated by setup-azure.ps1
# DO NOT COMMIT THIS FILE TO GIT!

ACR_REGISTRY = "$acrLoginServer"
ACR_USERNAME = "$acrUsername"
ACR_PASSWORD = "$acrPassword"
VM_IP = "$vmIp"
VM_USER = "azureuser"
RESOURCE_GROUP = "$ResourceGroupName"
VM_NAME = "$VmName"
"@

$configContent | Out-File -FilePath "azure-config.txt" -Encoding utf8
Write-Success "Configuration saved to azure-config.txt"

# Summary
Write-Host ""
Write-Success "=========================================="
Write-Success "✅ Azure Setup Completed!"
Write-Success "=========================================="
Write-Host ""
Write-Info "📋 Your Azure Resources:"
Write-Host "   Resource Group: $ResourceGroupName"
Write-Host "   ACR: $acrLoginServer"
Write-Host "   VM IP: $vmIp"
Write-Host ""
Write-Info "📝 Next Steps:"
Write-Host "   1. Update deploy.ps1 with these credentials"
Write-Host "   2. Test deployment: .\deploy.ps1 -Both -Version v16"
Write-Host "   3. Access app: http://$vmIp/Intranet/"
Write-Host ""
Write-Warning "⚠️  IMPORTANT: Save azure-config.txt securely!"
Write-Warning "   DO NOT commit it to Git!"
Write-Host ""

