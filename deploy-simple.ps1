# Simple Azure Deployment Script
# Run this in PowerShell

Write-Host "🚀 Starting Simple Azure Deployment..." -ForegroundColor Green

# Login to Azure (if not already logged in)
az login

# Set the resource group and app name
$resourceGroup = "AdeptIntranetRG"
$appName = "adept-intranet"

Write-Host "📝 Configuring App Service for Python..." -ForegroundColor Yellow

# Configure the app service for Python
az webapp config set --resource-group $resourceGroup --name $appName --linux-fx-version "PYTHON|3.11"

# Set application settings
Write-Host "⚙️ Setting application settings..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $resourceGroup --name $appName --settings `
    DJANGO_SETTINGS_MODULE="backend.settings_azure" `
    DJANGO_SECRET_KEY="django-insecure-$(Get-Random)-$(Get-Random)-very-secure-key" `
    PYTHONPATH="/home/site/wwwroot" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
    DJANGO_DEBUG="False"

# Set startup command
Write-Host "🔧 Setting startup command..." -ForegroundColor Yellow
az webapp config set --resource-group $resourceGroup --name $appName --startup-file "cd back-end && pip install -r requirements.txt && python manage.py migrate --settings=backend.settings_azure && gunicorn --bind 0.0.0.0:8000 backend.wsgi:application"

# Deploy the code
Write-Host "📦 Deploying code..." -ForegroundColor Yellow
az webapp deployment source config --resource-group $resourceGroup --name $appName --repo-url "https://github.com/Adept-IT-22/Intranet.git" --branch main --manual-integration

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app will be available at: https://adept-intranet.azurewebsites.net" -ForegroundColor Cyan
Write-Host "⏳ Please wait 3-5 minutes for the deployment to complete." -ForegroundColor Yellow
