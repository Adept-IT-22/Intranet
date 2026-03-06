#!/bin/bash

# Azure Deployment Script for Intranet Application
echo "Starting Azure deployment process..."

# Set variables
RESOURCE_GROUP="intranet-rg"
LOCATION="East US"
APP_SERVICE_PLAN="intranet-plan"
BACKEND_APP_NAME="intranet-backend"
FRONTEND_APP_NAME="intranet-frontend"
STORAGE_ACCOUNT="intranetstore$(date +%s)"

# Login to Azure (if not already logged in)
echo "Checking Azure login status..."
az account show > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to Azure:"
    az login
fi

# Create resource group
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

# Create Backend Web App
echo "Creating Backend Web App..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $BACKEND_APP_NAME \
    --runtime "PYTHON|3.11" \
    --deployment-local-git

# Configure Backend App Settings
echo "Configuring Backend App Settings..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --settings \
    DJANGO_SETTINGS_MODULE="backend.settings_azure" \
    PYTHONPATH="/home/site/wwwroot" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    ENABLE_ORYX_BUILD=true

# Create Storage Account for static files
echo "Creating Storage Account..."
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku Standard_LRS

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --resource-group $RESOURCE_GROUP \
    --account-name $STORAGE_ACCOUNT \
    --query '[0].value' \
    --output tsv)

# Configure storage settings
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --settings \
    AZURE_STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT \
    AZURE_STORAGE_ACCOUNT_KEY=$STORAGE_KEY \
    AZURE_STORAGE_CONTAINER="media"

# Create Static Web App for Frontend
echo "Creating Static Web App for Frontend..."
az staticwebapp create \
    --name $FRONTEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source https://github.com/Adept-IT-22/Intranet \
    --branch main \
    --app-location "frontend" \
    --api-location "" \
    --output-location "dist"

# Deploy Backend
echo "Deploying Backend..."
cd back-end
git remote add azure $(az webapp deployment source config-local-git \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query url \
    --output tsv)

# Get deployment credentials
DEPLOYMENT_USERNAME=$(az webapp deployment list-publishing-credentials \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query publishingUserName \
    --output tsv)

echo "Backend deployment URL configured. Push your code with:"
echo "git push azure main"
echo ""
echo "Deployment credentials:"
echo "Username: $DEPLOYMENT_USERNAME"
echo "Get password with: az webapp deployment list-publishing-credentials --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP --query publishingPassword --output tsv"

# Get app URLs
BACKEND_URL=$(az webapp show \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query defaultHostName \
    --output tsv)

FRONTEND_URL=$(az staticwebapp show \
    --name $FRONTEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query defaultHostname \
    --output tsv)

echo ""
echo "Deployment completed!"
echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update CORS settings in backend with frontend URL"
echo "2. Configure environment variables in Azure portal"
echo "3. Set up database (PostgreSQL or MySQL)"
echo "4. Configure custom domain (optional)"
