# Adept Intranet Deployment Script for Azure VM
# Usage: .\deploy.ps1 -Both -Version v17

param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest",
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Both
)

# =========================
# CONFIG: EDIT THESE VALUES
# =========================
$ACR_REGISTRY = "aptintra.azurecr.io"
$ACR_USER = "aptintra"
$ACR_PASS = "QXnHIFl2djNoRGgUTqqb0g1tgn/6WtYhB84f/+PD+6+ACRC/3UIF"  # ⚠️ Update this if changed
$VM_USER = "azureuser"
$VM_IP = "4.246.200.111"
$ALLOWED_HOSTS = "4.246.200.111,localhost,127.0.0.1"
# =========================

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "🚀 Adept Intranet Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Validate parameters
if (-not $Frontend -and -not $Backend -and -not $Both) {
    Write-Error "No deployment target specified. Use -Frontend, -Backend, or -Both"
    Write-Info "Examples:"
    Write-Info "  .\deploy.ps1 -Frontend -Version v17"
    Write-Info "  .\deploy.ps1 -Backend -Version v17"
    Write-Info "  .\deploy.ps1 -Both -Version v17"
    exit 1
}

# Login to Azure Container Registry
Write-Info "Logging into Azure Container Registry..."
try {
    $loginOutput = docker login $ACR_REGISTRY -u $ACR_USER -p $ACR_PASS 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker login failed"
    }
    Write-Success "Logged into ACR"
} catch {
    Write-Error "Failed to login to ACR: $_"
    Write-Info "Check your ACR credentials in deploy.ps1"
    exit 1
}

# Deploy Frontend
if ($Frontend -or $Both) {
    Write-Info "=========================================="
    Write-Info "Deploying Frontend (Version: $Version)"
    Write-Info "=========================================="
    
    $FrontendImage = "${ACR_REGISTRY}/intranet-frontend:${Version}"
    
    Write-Info "Building frontend image..."
    docker build -f Dockerfile.nginx -t $FrontendImage .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        exit 1
    }
    Write-Success "Frontend image built"
    
    Write-Info "Pushing frontend image to ACR..."
    docker push $FrontendImage
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend push failed"
        exit 1
    }
    Write-Success "Frontend image pushed"
    
    Write-Info "Deploying frontend to VM..."
    $frontendCmd = "docker network create intranet-network 2>/dev/null || true; docker stop intranet-frontend 2>/dev/null; docker rm intranet-frontend 2>/dev/null; docker pull ${FrontendImage}; docker run -d --name intranet-frontend --network intranet-network -p 80:80 --restart always ${FrontendImage}"
    ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" $frontendCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend deployment failed"
        Write-Info "Check SSH access: ssh ${VM_USER}@${VM_IP}"
        exit 1
    }
    Write-Success "Frontend deployed successfully"
}

# Deploy Backend
if ($Backend -or $Both) {
    Write-Info "=========================================="
    Write-Info "Deploying Backend (Version: $Version)"
    Write-Info "=========================================="
    
    $BackendImage = "${ACR_REGISTRY}/intranet-backend:${Version}"
    
    Write-Info "Building backend image..."
    docker build -f Intranet/back-end/Dockerfile -t $BackendImage Intranet/back-end/
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed"
        exit 1
    }
    Write-Success "Backend image built"
    
    Write-Info "Pushing backend image to ACR..."
    docker push $BackendImage
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend push failed"
        exit 1
    }
    Write-Success "Backend image pushed"
    
    Write-Info "Deploying backend to VM..."
    $backendCmd = "docker network create intranet-network 2>/dev/null || true; docker stop intranet-backend 2>/dev/null; docker rm intranet-backend 2>/dev/null; docker pull ${BackendImage}; docker run -d --name intranet-backend --network intranet-network -p 8000:8000 -e ALLOWED_HOSTS='${ALLOWED_HOSTS}' --restart always ${BackendImage}"
    ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" $backendCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend deployment failed"
        Write-Info "Check SSH access: ssh ${VM_USER}@${VM_IP}"
        exit 1
    }
    Write-Success "Backend deployed successfully"
    
    Write-Info "Running database migrations..."
    Start-Sleep -Seconds 5  # Wait for container to start
    ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" "docker exec intranet-backend python manage.py migrate --noinput"
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Migrations completed"
    } else {
        Write-Warning "Migrations may have failed - check logs"
    }
}

Write-Host ""
Write-Success "=========================================="
Write-Success "✅ Deployment Completed Successfully!"
Write-Success "=========================================="
Write-Host ""
Write-Info "Application URL: http://${VM_IP}/Intranet/"
Write-Info "Check container status: ssh ${VM_USER}@${VM_IP} 'docker ps'"
Write-Host ""

