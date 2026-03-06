# Deploy to Linux Server Script
# Server: 172.171.244.92
# Username: administrator

Write-Host "🚀 Deploying to Linux Server (172.171.244.92)..." -ForegroundColor Green

$serverIP = "172.171.244.92"
$username = "administrator"
$password = "R00t@4321!"

Write-Host "📦 Preparing deployment..." -ForegroundColor Yellow

# Create deployment commands
$deployCommands = @"
#!/bin/bash
echo "🔧 Setting up server environment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker `$USER

# Install additional dependencies
echo "📦 Installing dependencies..."
sudo apt install -y git curl wget python3 python3-pip python3-venv

# Clone repository
echo "📥 Cloning repository..."
cd /home/administrator
git clone https://github.com/Adept-IT-22/Intranet.git
cd Intranet

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << 'ENVEOF'
DJANGO_SETTINGS_MODULE=backend.settings
DJANGO_SECRET_KEY=django-insecure-server-deployment-key-`$(date +%s)
DJANGO_DEBUG=False
DATABASE_URL=postgresql://intranetuser:intranetpass@db:5432/intranetdb
REDIS_URL=redis://redis:6379/0
NGROK_FRONTEND_URL=
ENVEOF

# Start services
echo "🚀 Starting application services..."
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Show access URLs
echo "🌐 Application URLs:"
echo "Frontend: http://172.171.244.92:8080"
echo "Backend API: http://172.171.244.92:8001"
echo "Database: localhost:5433"

echo "✅ Deployment complete!"
"@

Write-Host "📤 Connecting to server and deploying..." -ForegroundColor Yellow

# Execute deployment on server using SSH
try {
    # Use plink (PuTTY) if available, otherwise use ssh
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        $deployCommands | plink -ssh $username@$serverIP -pw $password
    } else {
        # Alternative: use ssh if available
        $deployCommands | ssh $username@$serverIP
    }
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your application is now available at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://172.171.244.92:8080" -ForegroundColor White
    Write-Host "   Backend API: http://172.171.244.92:8001" -ForegroundColor White
    Write-Host "   Database: localhost:5433" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed. Please check the error above." -ForegroundColor Red
    Write-Host "💡 You can also manually SSH to the server and run the commands." -ForegroundColor Yellow
    Write-Host "   SSH Command: ssh administrator@172.171.244.92" -ForegroundColor Gray
}
