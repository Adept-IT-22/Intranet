# 🚀 How to Deploy Updates to Azure

## Quick Deploy (3 Steps)

1. **Make your code changes locally**

2. **Run the deployment script:**
   ```powershell
   .\deploy.ps1 -Both -Version v16
   ```
   *(Change v16 to your new version number)*

3. **Done!** Your updates are live at: http://4.246.200.111/Intranet/

## What the Script Does

The `deploy.ps1` script automatically:
- ✅ Builds Docker images for frontend and backend
- ✅ Pushes images to Azure Container Registry
- ✅ Deploys new containers to Azure VM
- ✅ Runs database migrations
- ✅ Restarts services

## Deploy Only Frontend or Backend

```powershell
# Deploy only frontend
.\deploy.ps1 -Frontend -Version v16

# Deploy only backend
.\deploy.ps1 -Backend -Version v16

# Deploy both (recommended)
.\deploy.ps1 -Both -Version v16
```

## Verify Deployment

```powershell
# Check containers are running
ssh azureuser@4.246.200.111 "docker ps"

# View logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 20"
```

## Rollback (If Needed)

```powershell
# Rollback to previous version (e.g., v15)
ssh azureuser@4.246.200.111 "docker stop intranet-frontend intranet-backend; docker rm intranet-frontend intranet-backend; docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v15; docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v15"
```

## Important Notes

- **Always increment version number** (v15 → v16 → v17)
- **Test locally first** before deploying
- **Keep previous version images** for quick rollback
- **Check logs** after deployment to ensure everything works

## Full Documentation

For detailed information, see:
- `AZURE_DEPLOYMENT.md` - Complete deployment guide
- `QUICK_UPDATE.md` - Quick reference
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

