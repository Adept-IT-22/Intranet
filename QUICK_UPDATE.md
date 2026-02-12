# 🚀 Quick Update Guide

## How to Deploy Updates to Live Application

### Method 1: Using PowerShell Script (Easiest)

1. **Make your code changes locally**

2. **Test locally** (optional but recommended):
   ```powershell
   # Backend
   cd Intranet\back-end
   python manage.py migrate
   python manage.py runserver
   
   # Frontend (new terminal)
   cd Intranet\frontend
   npm run dev
   ```

3. **Deploy using script:**
   ```powershell
   # Increment version number (e.g., v15 → v16)
   .\deploy.ps1 -Both -Version v16
   ```

   That's it! The script will:
   - Build Docker images
   - Push to Azure Container Registry
   - Deploy to Azure VM
   - Run database migrations

### Method 2: Manual Deployment

1. **Build and push images:**
   ```powershell
   # Login to ACR
   docker login aptintra.azurecr.io -u aptintra -p YOUR_PASSWORD
   
   # Build and push frontend
   docker build -f Dockerfile.nginx -t aptintra.azurecr.io/intranet-frontend:v16 .
   docker push aptintra.azurecr.io/intranet-frontend:v16
   
   # Build and push backend
   docker build -f Intranet/back-end/Dockerfile -t aptintra.azurecr.io/intranet-backend:v16 Intranet/back-end/
   docker push aptintra.azurecr.io/intranet-backend:v16
   ```

2. **Deploy to VM:**
   ```powershell
   # Frontend
   ssh azureuser@4.246.200.111 "docker stop intranet-frontend; docker rm intranet-frontend; docker pull aptintra.azurecr.io/intranet-frontend:v16; docker run -d --name intranet-frontend -p 80:80 --restart always aptintra.azurecr.io/intranet-frontend:v16"
   
   # Backend
   ssh azureuser@4.246.200.111 "docker stop intranet-backend; docker rm intranet-backend; docker pull aptintra.azurecr.io/intranet-backend:v16; docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' --restart always aptintra.azurecr.io/intranet-backend:v16"
   
   # Run migrations
   ssh azureuser@4.246.200.111 "docker exec intranet-backend python manage.py migrate --noinput"
   ```

### Method 3: GitHub Actions (Automated)

If you've set up GitHub Actions:

1. **Push to main branch** - automatically deploys
2. **Or trigger manually** - Go to Actions → Deploy to Azure → Run workflow

## 🔍 Verify Deployment

```powershell
# Check containers are running
ssh azureuser@4.246.200.111 "docker ps"

# Check logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 20"
ssh azureuser@4.246.200.111 "docker logs intranet-frontend --tail 20"

# Test application
# Open browser: http://4.246.200.111/Intranet/
```

## 🔄 Rollback (If Needed)

```powershell
# Rollback to previous version (e.g., v15)
ssh azureuser@4.246.200.111 "docker stop intranet-frontend intranet-backend; docker rm intranet-frontend intranet-backend; docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v15; docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v15"
```

## 📝 Version Numbering

Use semantic versioning:
- **v15, v16, v17** - Major updates
- **v15.1, v15.2** - Minor updates
- **v15.1.1** - Patch updates

Always increment the version number for each deployment!

