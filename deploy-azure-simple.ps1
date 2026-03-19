# Simplest Azure Deployment - Container Instances
# Run this in PowerShell

Write-Host "🚀 Starting Simple Azure Container Deployment..." -ForegroundColor Green

# Login to Azure
az login

# Variables
$resourceGroup = "AdeptIntranetRG"
$containerName = "adept-intranet-simple"
$location = "East US"

Write-Host "📦 Creating container instance..." -ForegroundColor Yellow

# Create container instance directly from GitHub
az container create `
    --resource-group $resourceGroup `
    --name $containerName `
    --image mcr.microsoft.com/appsvc/python:3.11_20231201.1.tuxprod `
    --git-repo-url "https://github.com/Adept-IT-22/Intranet.git" `
    --git-repo-mount-path "/app" `
    --dns-name-label "adept-intranet-simple" `
    --ports 8000 `
    --environment-variables `
        DJANGO_SETTINGS_MODULE="backend.settings_azure" `
        DJANGO_SECRET_KEY="django-insecure-simple-deployment-key-123456789" `
        PYTHONPATH="/app/back-end" `
    --command-line "cd /app/back-end && pip install -r requirements.txt && python manage.py migrate --settings=backend.settings_azure && python manage.py runserver 0.0.0.0:8000"

Write-Host "✅ Container deployed!" -ForegroundColor Green
Write-Host "🌐 Your app will be available at: http://adept-intranet-simple.eastus.azurecontainer.io:8000" -ForegroundColor Cyan
