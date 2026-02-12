# PowerShell script to diagnose login issues
param(
    [string]$ServerIP = "192.168.1.154",
    [string]$Username = "administrator"
)

Write-Host "🔍 Diagnosing login issues..." -ForegroundColor Green

# Check container status
Write-Host "📊 Checking container status..." -ForegroundColor Yellow
$containerCheck = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'cd /home/administrator/Intranet && docker-compose ps'"
Invoke-Expression $containerCheck

Write-Host "`n🔍 Checking backend logs..." -ForegroundColor Yellow
$backendLogs = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'cd /home/administrator/Intranet && docker-compose logs --tail=20 backend'"
Invoke-Expression $backendLogs

Write-Host "`n🔍 Checking frontend logs..." -ForegroundColor Yellow
$frontendLogs = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'cd /home/administrator/Intranet && docker-compose logs --tail=20 frontend'"
Invoke-Expression $frontendLogs

Write-Host "`n🔍 Testing backend API connectivity..." -ForegroundColor Yellow
$apiTest = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'curl -v http://localhost:8001/api/ 2>&1 || echo API not accessible'"
Invoke-Expression $apiTest

Write-Host "`n🔍 Testing frontend accessibility..." -ForegroundColor Yellow
$frontendTest = "ssh -o StrictHostKeyChecking=no $Username@$ServerIP 'curl -v http://localhost:8080/ 2>&1 | head -10 || echo Frontend not accessible'"
Invoke-Expression $frontendTest

Write-Host "`n✅ Diagnosis completed!" -ForegroundColor Green
