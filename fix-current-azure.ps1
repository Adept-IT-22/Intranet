# Fix Current Azure App Service - Simplest Method
# Run this in PowerShell

Write-Host "🔧 Fixing your current Azure App Service..." -ForegroundColor Green

# Login to Azure
az login

# Variables
$resourceGroup = "AdeptIntranetRG"
$appName = "adept-intranet"

Write-Host "📝 Resetting to Python runtime..." -ForegroundColor Yellow

# Reset to Python runtime (not Docker)
az webapp config set `
    --resource-group $resourceGroup `
    --name $appName `
    --linux-fx-version "PYTHON|3.11"

Write-Host "⚙️ Setting simple configuration..." -ForegroundColor Yellow

# Set simple startup command
az webapp config set `
    --resource-group $resourceGroup `
    --name $appName `
    --startup-file "cd back-end && pip install -r requirements.txt && python manage.py collectstatic --noinput --settings=backend.settings_azure && python manage.py migrate --settings=backend.settings_azure && gunicorn --bind=0.0.0.0 --timeout 600 backend.wsgi"

# Set environment variables
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $appName `
    --settings `
        DJANGO_SETTINGS_MODULE="backend.settings_azure" `
        DJANGO_SECRET_KEY="django-insecure-simple-fix-$(Get-Random)-$(Get-Random)" `
        PYTHONPATH="/home/site/wwwroot/back-end" `
        SCM_DO_BUILD_DURING_DEPLOYMENT="true"

Write-Host "🔄 Restarting app..." -ForegroundColor Yellow
az webapp restart --resource-group $resourceGroup --name $appName

Write-Host "✅ App service fixed!" -ForegroundColor Green
Write-Host "🌐 Your app should work at: https://adept-intranet.azurewebsites.net" -ForegroundColor Cyan
Write-Host "⏳ Wait 3-5 minutes for the changes to take effect." -ForegroundColor Yellow
