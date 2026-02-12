# 🚀 Deploy to Azure - Quick Start

## To Deploy Updates:

```powershell
.\deploy.ps1 -Both -Version v16
```

**That's it!** Replace `v16` with your new version number.

## What Happens:

1. ✅ Builds Docker images
2. ✅ Pushes to Azure Container Registry  
3. ✅ Deploys to Azure VM
4. ✅ Runs database migrations
5. ✅ Application is live!

## Your Application URL:

**http://4.246.200.111/Intranet/**

## Deploy Options:

```powershell
# Deploy both frontend and backend
.\deploy.ps1 -Both -Version v16

# Deploy only frontend
.\deploy.ps1 -Frontend -Version v16

# Deploy only backend  
.\deploy.ps1 -Backend -Version v16
```

## Verify Deployment:

```powershell
# Check containers
ssh azureuser@4.246.200.111 "docker ps"

# View logs
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 20"
```

## Need More Details?

See `AZURE_DEPLOYMENT.md` for complete guide.

