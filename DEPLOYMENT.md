# Azure Deployment Guide for Intranet Application

This guide will help you deploy the Intranet application to Microsoft Azure using Azure App Service for the backend and Azure Static Web Apps for the frontend.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure CLI**: Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Git**: Ensure Git is installed and configured
4. **Node.js**: Version 18.x or higher
5. **Python**: Version 3.11

## Quick Deployment (Automated)

### Option 1: Using the Deployment Script

1. **Login to Azure CLI**:
   ```bash
   az login
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy-azure.sh
   ```

3. **Follow the prompts** and note the URLs provided at the end.

### Option 2: Using GitHub Actions

1. **Fork the repository** to your GitHub account

2. **Set up secrets** in your GitHub repository:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure portal
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get from Azure Static Web Apps

3. **Push to main branch** - deployment will trigger automatically

## Manual Deployment

### Step 1: Create Azure Resources

1. **Create Resource Group**:
   ```bash
   az group create --name intranet-rg --location "East US"
   ```

2. **Create App Service Plan**:
   ```bash
   az appservice plan create \
     --name intranet-plan \
     --resource-group intranet-rg \
     --sku B1 \
     --is-linux
   ```

3. **Create Backend Web App**:
   ```bash
   az webapp create \
     --resource-group intranet-rg \
     --plan intranet-plan \
     --name intranet-backend-[unique-suffix] \
     --runtime "PYTHON|3.11"
   ```

4. **Create Static Web App for Frontend**:
   ```bash
   az staticwebapp create \
     --name intranet-frontend \
     --resource-group intranet-rg \
     --source https://github.com/your-username/Intranet \
     --branch main \
     --app-location "frontend" \
     --output-location "dist"
   ```

### Step 2: Configure Backend

1. **Set Application Settings**:
   ```bash
   az webapp config appsettings set \
     --resource-group intranet-rg \
     --name intranet-backend-[unique-suffix] \
     --settings \
     DJANGO_SETTINGS_MODULE="backend.settings_azure" \
     PYTHONPATH="/home/site/wwwroot" \
     SCM_DO_BUILD_DURING_DEPLOYMENT=true
   ```

2. **Configure Database** (Optional - PostgreSQL):
   ```bash
   az postgres server create \
     --resource-group intranet-rg \
     --name intranet-db-[unique-suffix] \
     --admin-user dbadmin \
     --admin-password [secure-password] \
     --sku-name B_Gen5_1
   ```

### Step 3: Deploy Backend

1. **Navigate to backend directory**:
   ```bash
   cd back-end
   ```

2. **Add Azure remote**:
   ```bash
   git remote add azure [deployment-url-from-azure]
   ```

3. **Deploy**:
   ```bash
   git push azure main
   ```

### Step 4: Configure Frontend

1. **Update API URLs** in `frontend/src/api.js`:
   ```javascript
   const API_URL = "https://intranet-backend-[unique-suffix].azurewebsites.net/api";
   ```

2. **Build and deploy** (handled automatically by Static Web Apps)

## Environment Variables

### Backend Environment Variables (Azure App Service)

Set these in the Azure portal under Configuration > Application settings:

```
DJANGO_SETTINGS_MODULE=backend.settings_azure
DJANGO_SECRET_KEY=[generate-secure-key]
DJANGO_DEBUG=False
DATABASE_URL=[database-connection-string]
AZURE_STORAGE_ACCOUNT_NAME=[storage-account-name]
AZURE_STORAGE_ACCOUNT_KEY=[storage-account-key]
SENDGRID_API_KEY=[sendgrid-api-key]
REDIS_URL=[redis-connection-string]
```

### Frontend Environment Variables

Set these in the Static Web App configuration:

```
VITE_API_URL=https://intranet-backend-[unique-suffix].azurewebsites.net/api
```

## Database Setup

### Option 1: Azure Database for PostgreSQL

1. **Create PostgreSQL server**:
   ```bash
   az postgres server create \
     --resource-group intranet-rg \
     --name intranet-db \
     --admin-user dbadmin \
     --admin-password [secure-password]
   ```

2. **Create database**:
   ```bash
   az postgres db create \
     --resource-group intranet-rg \
     --server-name intranet-db \
     --name intranet
   ```

3. **Configure firewall**:
   ```bash
   az postgres server firewall-rule create \
     --resource-group intranet-rg \
     --server intranet-db \
     --name AllowAzureServices \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0
   ```

### Option 2: SQLite (Development only)

For development/testing, the application will use SQLite by default.

## SSL/HTTPS Configuration

Azure App Service and Static Web Apps provide SSL certificates automatically. Your application will be available at:

- Backend: `https://intranet-backend-[unique-suffix].azurewebsites.net`
- Frontend: `https://[app-name].azurestaticapps.net`

## Custom Domain (Optional)

1. **Add custom domain** in Azure portal
2. **Configure DNS** with your domain provider
3. **Enable SSL** for custom domain

## Monitoring and Logging

1. **Enable Application Insights**:
   ```bash
   az monitor app-insights component create \
     --app intranet-insights \
     --location "East US" \
     --resource-group intranet-rg
   ```

2. **Configure logging** in Azure portal under Monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Python/Node.js versions
   - Verify requirements.txt/package.json
   - Check build logs in Azure portal

2. **Database Connection Issues**:
   - Verify connection string
   - Check firewall rules
   - Ensure database exists

3. **CORS Issues**:
   - Update CORS_ALLOWED_ORIGINS in settings
   - Verify frontend URL configuration

4. **Static Files Not Loading**:
   - Run `python manage.py collectstatic`
   - Check Azure Storage configuration

### Useful Commands

- **View logs**: `az webapp log tail --name [app-name] --resource-group [rg-name]`
- **Restart app**: `az webapp restart --name [app-name] --resource-group [rg-name]`
- **SSH into container**: Available in Azure portal under Development Tools

## Cost Optimization

1. **Use B1 tier** for development/testing
2. **Scale up** for production workloads
3. **Monitor usage** with Azure Cost Management
4. **Set up alerts** for cost thresholds

## Security Best Practices

1. **Use managed identities** for Azure services
2. **Enable HTTPS only**
3. **Configure proper CORS settings**
4. **Use Azure Key Vault** for secrets
5. **Enable Azure Security Center**

## Backup and Recovery

1. **Enable automatic backups** in Azure portal
2. **Set up database backups**
3. **Document recovery procedures**

## Support

For issues with this deployment:
1. Check Azure portal logs
2. Review GitHub Actions logs
3. Contact your Azure support team
4. Refer to Azure documentation

---

**Note**: Replace `[unique-suffix]`, `[secure-password]`, and other placeholders with actual values during deployment.

