# 🚀 Deploy to Azure VM - Quick Guide

Deploy your updates to the existing Azure VM server.

## 📋 What You Need

- ✅ Azure Container Registry (ACR) - `aptintra.azurecr.io`
- ✅ Azure VM - `4.246.200.111`
- ✅ SSH access to VM
- ✅ Docker installed locally

## 🚀 Quick Deploy (3 Steps)

### Step 1: Create deploy.ps1

Create `deploy.ps1` file with your credentials:

```powershell
# Copy from deploy.ps1.template and fill in:
$ACR_REGISTRY = "aptintra.azurecr.io"
$ACR_USER = "aptintra"
$ACR_PASS = "YOUR_ACR_PASSWORD"  # Get from Azure Portal
$VM_USER = "azureuser"
$VM_IP = "4.246.200.111"
```

### Step 2: Deploy

```powershell
.\deploy.ps1 -Both -Version v17
```

### Step 3: Done!

Your app is live at: **http://4.246.200.111/Intranet/**

## 📝 Manual Deployment (If Script Doesn't Work)

### 1. Build and Push Images

```powershell
# Login to ACR
docker login aptintra.azurecr.io -u aptintra -p YOUR_PASSWORD

# Build frontend
docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v17 .
docker push aptintra.azurecr.io/intranet-frontend:v17

# Build backend
docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v17 Intranet/back-end/
docker push aptintra.azurecr.io/intranet-backend:v17
```

### 2. Deploy to VM

```powershell
# Frontend
ssh azureuser@4.246.200.111 "docker stop intranet-frontend; docker rm intranet-frontend; docker pull aptintra.azurecr.io/intranet-frontend:v17; docker run -d --name intranet-frontend --network intranet-network -p 80:80 --restart always aptintra.azurecr.io/intranet-frontend:v17"

# Backend
ssh azureuser@4.246.200.111 "docker stop intranet-backend; docker rm intranet-backend; docker pull aptintra.azurecr.io/intranet-backend:v17; docker run -d --name intranet-backend --network intranet-network -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' --restart always aptintra.azurecr.io/intranet-backend:v17"

# Run migrations
ssh azureuser@4.246.200.111 "docker exec intranet-backend python manage.py migrate --noinput"
```

## 🔍 Verify Deployment

```powershell
# Check containers
ssh azureuser@4.246.200.111 "docker ps"

# View logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 20"
ssh azureuser@4.246.200.111 "docker logs intranet-frontend --tail 20"
```

## 🔄 Future Updates

Just run:
```powershell
.\deploy.ps1 -Both -Version v18  # Increment version number
```

## 🆘 Troubleshooting

### Can't SSH to VM?
- Check VM is running in Azure Portal
- Verify SSH key is correct
- Check firewall rules

### Can't push to ACR?
- Verify ACR credentials
- Check you're logged in: `docker login aptintra.azurecr.io`

### Containers won't start?
- Check logs: `docker logs intranet-backend`
- Verify network exists: `docker network ls`
- Check ports aren't in use

## 📞 Your Server Info

- **VM IP**: `4.246.200.111`
- **ACR**: `aptintra.azurecr.io`
- **App URL**: `http://4.246.200.111/Intranet/`

