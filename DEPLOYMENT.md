# Adept Intranet Deployment Guide

This guide explains how to deploy updates to your Adept Intranet application on Azure VM.

## 🚀 Quick Deployment

### Using PowerShell (Windows)
```powershell
# Deploy frontend only
.\deploy.ps1 -Frontend -Version v11

# Deploy backend only  
.\deploy.ps1 -Backend -Version v3

# Deploy both frontend and backend
.\deploy.ps1 -Both -Version v12
```

### Using Bash (Linux/Mac)
```bash
# Deploy frontend only
./deploy.sh --frontend --version v11

# Deploy backend only
./deploy.sh --backend --version v3

# Deploy both frontend and backend
./deploy.sh --both --version v12
```

## 📋 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build and Push Images
```bash
# Frontend
docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v11 .
docker push aptintra.azurecr.io/intranet-frontend:v11

# Backend
docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v3 Intranet/back-end/
docker push aptintra.azurecr.io/intranet-backend:v3
```

### 2. Deploy to VM
```bash
# Frontend
ssh azureuser@4.246.200.111 "docker stop intranet-frontend && docker rm intranet-frontend && docker pull aptintra.azurecr.io/intranet-frontend:v11 && docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v11"

# Backend
ssh azureuser@4.246.200.111 "docker stop intranet-backend && docker rm intranet-backend && docker pull aptintra.azurecr.io/intranet-backend:v3 && docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v3"
```

## 🔧 Configuration Details

### Environment Variables
- **ALLOWED_HOSTS**: `4.246.200.111,localhost,127.0.0.1`
- **DEBUG**: `True` (for development)

### Port Mappings
- **Frontend (nginx)**: Port 80 → Serves React app and proxies API calls
- **Backend (Django)**: Port 8000 → API and WebSocket endpoints

### JWT Configuration
- ✅ JWT tokens are properly configured for WebSocket authentication
- ✅ Custom middleware handles JWT authentication for chat functionality
- ✅ Tokens are stored in localStorage and sent with API requests

## 🌐 Access URLs

- **Application**: http://4.246.200.111/Intranet/
- **Login**: http://4.246.200.111/Intranet/login
- **Dashboard**: http://4.246.200.111/Intranet/dashboard

## 🔍 Troubleshooting

### Check Container Status
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

### Test API Connectivity
```bash
ssh azureuser@4.246.200.111 "curl -I http://localhost:8000/api/token/"
```

## 📝 Version History

- **v10**: Fixed hardcoded localhost URLs in frontend
- **v3**: Fixed JWT WebSocket authentication for chat feature
- **v2**: Initial deployment with proper ALLOWED_HOSTS configuration

## 🎯 Next Steps

1. **Test the chat feature** - WebSocket authentication should now work properly
2. **Monitor logs** - Check for any authentication issues
3. **Update versions** - Use the deployment scripts for future updates

## 📞 Support

If you encounter any issues:
1. Check the container logs
2. Verify environment variables are set correctly
3. Ensure both containers are running
4. Test API endpoints manually


