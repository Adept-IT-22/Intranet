# Adept Intranet - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker installed locally
- SSH access to Azure VM (`azureuser@4.246.200.111`)
- Azure Container Registry credentials

### Current Setup
- **Frontend**: nginx serving React app on port 80
- **Backend**: Django API on port 8000
- **Registry**: `aptintra.azurecr.io`

## 📋 Deployment Commands

### Deploy Frontend Only
```bash
# Build and push
docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v11 .
docker push aptintra.azurecr.io/intranet-frontend:v11

# Deploy to VM
ssh azureuser@4.246.200.111 "docker stop intranet-frontend && docker rm intranet-frontend && docker pull aptintra.azurecr.io/intranet-frontend:v11 && docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v11"
```

### Deploy Backend Only
```bash
# Build and push
docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v3 Intranet/back-end/
docker push aptintra.azurecr.io/intranet-backend:v3

# Deploy to VM
ssh azureuser@4.246.200.111 "docker stop intranet-backend && docker rm intranet-backend && docker pull aptintra.azurecr.io/intranet-backend:v3 && docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v3"
```

## 🔧 Using Deployment Scripts

### PowerShell (Windows)
```powershell
# Deploy frontend
.\deploy.ps1 -Frontend -Version v11

# Deploy backend
.\deploy.ps1 -Backend -Version v3

# Deploy both
.\deploy.ps1 -Both -Version v12
```

### Bash (Linux/Mac)
```bash
# Deploy frontend
./deploy.sh --frontend --version v11

# Deploy backend
./deploy.sh --backend --version v3

# Deploy both
./deploy.sh --both --version v12
```

## 🔍 Troubleshooting

### Check Status
```bash
ssh azureuser@4.246.200.111 "docker ps"
```

### View Logs
```bash
# Frontend logs
ssh azureuser@4.246.200.111 "docker logs intranet-frontend --tail 20"

# Backend logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 20"
```

### Test API
```bash
ssh azureuser@4.246.200.111 "curl -I http://localhost:8000/api/token/"
```

## 🌐 Access URLs
- **Application**: http://4.246.200.111/Intranet/
- **Login**: http://4.246.200.111/Intranet/login

## 📝 Important Notes
- Always increment version numbers (v11, v12, etc.)
- Backend requires `ALLOWED_HOSTS` environment variable
- Frontend proxies API calls to backend automatically
- Both containers must be running for full functionality

## 🆘 Quick Fixes
- **Login issues**: Check `ALLOWED_HOSTS` environment variable
- **404 errors**: Verify nginx configuration and port mappings
- **API errors**: Check backend logs and container status
