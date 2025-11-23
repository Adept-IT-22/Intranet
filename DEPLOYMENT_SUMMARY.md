# 🚀 Azure Deployment Summary

## Quick Start

### Deploy Updates (Easiest Method)

```powershell
# 1. Make your code changes
# 2. Test locally (optional)
# 3. Deploy with one command:
.\deploy.ps1 -Both -Version v16
```

That's it! The script handles everything:
- ✅ Builds Docker images
- ✅ Pushes to Azure Container Registry
- ✅ Deploys to Azure VM
- ✅ Runs database migrations

## 📁 Files Created

1. **`deploy.ps1`** - Main deployment script (updated)
2. **`AZURE_DEPLOYMENT.md`** - Complete deployment guide
3. **`QUICK_UPDATE.md`** - Quick reference for updates
4. **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment checklist
5. **`.github/workflows/deploy.yml`** - GitHub Actions CI/CD (optional)

## 🔄 Update Process

### Step 1: Make Changes
Edit your code locally

### Step 2: Test Locally (Recommended)
```powershell
# Backend
cd Intranet\back-end
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd Intranet\frontend
npm run dev
```

### Step 3: Deploy
```powershell
.\deploy.ps1 -Both -Version v16
```

### Step 4: Verify
- Open: http://4.246.200.111/Intranet/
- Test new features
- Check logs if needed

## 📝 Version Numbering

Always increment version number:
- v15 → v16 → v17 (major updates)
- v16 → v16.1 (minor updates)

## 🔍 Troubleshooting

### Check Container Status
```powershell
ssh azureuser@4.246.200.111 "docker ps"
```

### View Logs
```powershell
ssh azureuser@4.246.200.111 "docker logs intranet-backend --tail 50"
ssh azureuser@4.246.200.111 "docker logs intranet-frontend --tail 50"
```

### Restart Containers
```powershell
ssh azureuser@4.246.200.111 "docker restart intranet-frontend intranet-backend"
```

## 🔄 Rollback

If something goes wrong:
```powershell
ssh azureuser@4.246.200.111 "docker stop intranet-frontend intranet-backend; docker rm intranet-frontend intranet-backend; docker run -d --name intranet-frontend -p 80:80 aptintra.azurecr.io/intranet-frontend:v15; docker run -d --name intranet-backend -p 8000:8000 -e ALLOWED_HOSTS='4.246.200.111,localhost,127.0.0.1' aptintra.azurecr.io/intranet-backend:v15"
```

## 🎯 Best Practices

1. **Always test locally first**
2. **Increment version number for each deployment**
3. **Keep previous version images for rollback**
4. **Check logs after deployment**
5. **Verify all features work after deployment**

## 📞 Need Help?

1. Check `AZURE_DEPLOYMENT.md` for detailed guide
2. Check `QUICK_UPDATE.md` for quick reference
3. Check container logs for errors
4. Verify environment variables are set correctly

