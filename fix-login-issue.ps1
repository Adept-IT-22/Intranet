# PowerShell script to fix login issues
param(
    [string]$ServerIP = "172.171.244.92",
    [string]$Username = "administrator",
    [string]$Password = "R00t@4321!"
)

Write-Host "🔍 Diagnosing and fixing login issues..." -ForegroundColor Green

# Create the fix script
$fixScript = @'
#!/bin/bash
echo "🔍 Diagnosing and fixing login issues..."

# Check container status
echo "📊 Checking container status..."
cd /home/administrator/Intranet
docker-compose ps

echo ""
echo "🔍 Checking backend logs..."
docker-compose logs --tail=20 backend

echo ""
echo "🔍 Checking frontend logs..."
docker-compose logs --tail=20 frontend

echo ""
echo "🔍 Testing backend API..."
curl -v http://localhost:8001/api/ 2>&1 | head -10

echo ""
echo "🔍 Testing frontend..."
curl -v http://localhost:8080/ 2>&1 | head -10

echo ""
echo "🔧 Fixing potential issues..."

# Restart containers with fresh build
echo "🔄 Restarting containers..."
docker-compose down
docker-compose up -d --build --force-recreate

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "📊 Final status check..."
docker-compose ps

echo ""
echo "✅ Login fix attempt completed!"
echo "🌐 Frontend: http://172.171.244.92:8080"
echo "🔗 Backend API: http://172.171.244.92:8001/api/"
'@

# Upload and run the script
$tempFile = "fix-login-temp.sh"
$fixScript | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📤 Uploading fix script to server..." -ForegroundColor Yellow

try {
    # Upload script
    $uploadCommand = "scp -o StrictHostKeyChecking=no $tempFile $Username@$ServerIP:/tmp/fix-login.sh"
    Invoke-Expression $uploadCommand
    
    # Make executable and run
    $runCommand = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'chmod +x /tmp/fix-login.sh && /tmp/fix-login.sh'"
    Invoke-Expression $runCommand
    
    Write-Host "✅ Login fix completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. SSH: ssh administrator@172.171.244.92" -ForegroundColor Yellow
    Write-Host "2. Run: cd /home/administrator/Intranet" -ForegroundColor Yellow
    Write-Host "3. Run: docker-compose down && docker-compose up -d --build" -ForegroundColor Yellow
} finally {
    # Clean up
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}
