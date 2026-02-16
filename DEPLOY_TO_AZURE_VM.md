# 🚀 Deploy to Azure VM - Simple Guide

Deploy your updates to the existing Azure VM server.

## ⚡ Quick Deploy

### Step 1: Get ACR Password

1. Go to Azure Portal
2. Navigate to: **Container Registries** → `aptintra` (or your ACR)
3. Click **"Access keys"**
4. Copy **password1** or **password2**

### Step 2: Update deploy.ps1 Locally

Open `deploy.ps1` and update line 17:
```powershell
$ACR_PASS = "YOUR_ACR_PASSWORD"  # Paste the password from Step 1
```

### Step 3: Deploy!

```powershell
.\deploy.ps1 -Both -Version v17
```

**That's it!** Your app will be deployed to: **http://192.168.1.154:8080/Intranet/**

## 📝 What the Script Does

1. ✅ Logs into Azure Container Registry
2. ✅ Builds Docker images (frontend & backend)
3. ✅ Pushes images to ACR
4. ✅ Deploys to Azure VM via SSH
5. ✅ Runs database migrations
6. ✅ Your app is live!

## 🔄 Future Updates

Just increment the version and deploy:

```powershell
.\deploy.ps1 -Both -Version v18
.\deploy.ps1 -Both -Version v19
# etc.
```

## 🔍 Verify Deployment

```powershell
# Check containers are running
ssh azureuser@192.168.1.154 "docker ps"

# View logs
ssh azureuser@192.168.1.154 "docker logs intranet-backend --tail 20"
```

## 🆘 Troubleshooting

**Can't login to ACR?**
- Verify password is correct
- Check ACR admin user is enabled

**SSH fails?**
- Check VM is running
- Verify SSH key is correct

**Containers won't start?**
- Check logs: `docker logs intranet-backend`
- Verify network exists: `docker network ls`

## 📞 Your Server Info

- **VM IP**: `192.168.1.154`
- **Port**: `8080`
- **ACR**: `aptintra.azurecr.io`
- **App URL**: `http://192.168.1.154:8080/Intranet/`

---

**Note**: `deploy.ps1` is not in GitHub (contains password). Create it locally using `deploy.ps1.template` as a guide.

