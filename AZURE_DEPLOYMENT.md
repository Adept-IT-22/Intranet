# Azure Deployment Guide - Adept Intranet

This guide covers deploying and updating the Adept Intranet application on Azure.

## 🏗️ Architecture

- **Frontend**: React app served via Nginx (Docker container)
- **Backend**: Django REST API + WebSocket (Docker container)
- **Database**: PostgreSQL (can use Azure Database for PostgreSQL or container)
- **Container Registry**: Azure Container Registry (ACR)
- **Deployment Target**: Azure VM or Azure App Service for Containers

## 📋 Prerequisites

1. **Azure Account** with:
   - Azure Container Registry (ACR)
   - Azure VM or App Service
   - Docker installed locally

2. **Credentials** (stored in `deploy.ps1`):
   - ACR login server: `aptintra.azurecr.io`
   - ACR username and password
   - VM IP address and SSH credentials

## 🚀 Initial Deployment

### Option 1: Using PowerShell Script (Recommended)

```powershell
# Deploy both frontend and backend
.\deploy.ps1 -Both -Version v15

# Or deploy individually
.\deploy.ps1 -Frontend -Version v15
.\deploy.ps1 -Backend -Version v15
```

### Option 2: Manual Deployment

1. **Build and push images:**
   ```powershell
   # Login to ACR
   docker login aptintra.azurecr.io -u aptintra -p YOUR_PASSWORD

   # Build frontend
   docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v15 .
   docker push aptintra.azurecr.io/intranet-frontend:v15

   # Build backend
   docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v15 Intranet/back-end/
   docker push aptintra.azurecr.io/intranet-backend:v15
   ```

2. **Deploy to VM:**
   ```powershell
   # Frontend
   ssh azureuser@4.246.200.111 "docker stop intranet-frontend; docker rm intranet-frontend; docker pull aptintra.azurecr.io/intranet-frontend:v15; docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v15"

   # Backend
   ssh azureuser@4.246.200.111 "docker stop intranet-backend; docker rm intranet-backend; docker pull aptintra.azurecr.io/intranet-backend:v15; docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v15"
   ```

## 🔄 Updating Live Application

### Quick Update Process

When you make changes and want to deploy updates:

1. **Increment version number** (e.g., v15 → v16)

2. **Run deployment script:**
   ```powershell
   .\deploy.ps1 -Both -Version v16
   ```

3. **Verify deployment:**
   - Check containers are running: `ssh azureuser@4.246.200.111 "docker ps"`
   - Test application: `http://4.246.200.111/Intranet/`

### Step-by-Step Update Process

1. **Make your code changes locally**

2. **Test locally:**
   ```powershell
   # Run backend
   cd Intranet\back-end
   python manage.py migrate
   python manage.py runserver

   # Run frontend (in another terminal)
   cd Intranet\frontend
   npm run dev
   ```

3. **Build new Docker images:**
   ```powershell
   # Frontend
   docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v16 .
   docker push aptintra.azurecr.io/intranet-frontend:v16

   # Backend
   docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v16 Intranet/back-end/
   docker push aptintra.azurecr.io/intranet-backend:v16
   ```

4. **Deploy to Azure VM:**
   ```powershell
   # Frontend
   ssh azureuser@4.246.200.111 "docker stop intranet-frontend && docker rm intranet-frontend && docker pull aptintra.azurecr.io/intranet-frontend:v16 && docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v16"

   # Backend (with migrations)
   ssh azureuser@4.246.200.111 "docker stop intranet-backend && docker rm intranet-backend && docker pull aptintra.azurecr.io/intranet-backend:v16 && docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v16 && docker exec intranet-backend python manage.py migrate"
   ```

## 🔧 Environment Variables

### Backend Container

Set these when running the backend container:

- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
  - Example: `4.246.200.111,localhost,127.0.0.1`
- `DEBUG`: Set to `False` in production
- `REDIS_HOST`: Redis server hostname (if using Redis)
- `REDIS_PORT`: Redis port (default: 6379)

### Frontend Container

The frontend uses Nginx and proxies `/api/` requests to the backend.

## 📊 Database Migrations

When deploying updates that include database changes:

```powershell
# Run migrations on the backend container
ssh azureuser@4.246.200.111 "docker exec intranet-backend python manage.py migrate"
```

Or include in deployment script (see updated `deploy.ps1`).

## 🔍 Monitoring & Troubleshooting

### Check Container Status
```powershell
ssh azureuser@4.246.200.111 "docker ps"
```

### View Logs
```powershell
# Frontend logs
ssh azureuser@4.246.200.111 "docker logs intranet-frontend --tail 50"

# Backend logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 50"
```

### Test API
```powershell
ssh azureuser@4.246.200.111 "curl http://localhost:8000/api/"
```

### Restart Containers
```powershell
ssh azureuser@4.246.200.111 "docker restart intranet-frontend intranet-backend"
```

## 🎯 Best Practices

1. **Version Tagging**: Always use version tags (v15, v16, etc.) for images
2. **Test Locally First**: Always test changes locally before deploying
3. **Database Backups**: Backup database before running migrations
4. **Rollback Plan**: Keep previous version images for quick rollback
5. **Monitor Logs**: Check logs after deployment to ensure everything works

## 🔄 Rollback Process

If something goes wrong, rollback to previous version:

```powershell
# Rollback frontend
ssh azureuser@4.246.200.111 "docker stop intranet-frontend && docker rm intranet-frontend && docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v15"

# Rollback backend
ssh azureuser@4.246.200.111 "docker stop intranet-backend && docker rm intranet-backend && docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v15"
```

## 📝 Version History

- **v15**: Added announcements, innovations, notifications, super admin
- **v14**: Group chat, private conversations, file attachments
- **v13**: Initial deployment with chat functionality

## 🚨 Important Notes

1. **Database**: Ensure database is accessible from the backend container
2. **Media Files**: Media files (uploads) are stored in the container - consider using Azure Blob Storage for production
3. **WebSocket**: Ensure WebSocket connections are allowed through firewall/load balancer
4. **SSL/HTTPS**: Consider adding SSL certificate for production

## 📞 Support

For deployment issues:
1. Check container logs
2. Verify environment variables
3. Test API endpoints
4. Check network connectivity between containers

