#!/bin/bash

# Automated Deployment Script for Linux Server
# Server: 172.171.244.92
# Username: administrator

echo "🚀 Starting deployment to Linux server..."

# Server details
SERVER_IP="172.171.244.92"
SERVER_USER="administrator"
SERVER_PASS="R00t@4321!"

echo "📦 Preparing deployment package..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Clone the repository
echo "📥 Cloning repository..."
git clone https://github.com/Adept-IT-22/Intranet.git

cd Intranet

# Create deployment script for the server
cat > server-deploy.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up server environment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install additional dependencies
echo "📦 Installing dependencies..."
sudo apt install -y git curl wget python3 python3-pip python3-venv

# Navigate to project directory
cd /home/administrator/Intranet

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << 'ENVEOF'
DJANGO_SETTINGS_MODULE=backend.settings
DJANGO_SECRET_KEY=django-insecure-server-deployment-key-$(date +%s)
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
EOF

# Make script executable
chmod +x server-deploy.sh

echo "📤 Uploading to server..."

# Upload to server using scp
scp -r . administrator@172.171.244.92:/home/administrator/

echo "🔧 Running deployment on server..."

# Execute deployment on server
ssh administrator@172.171.244.92 << 'REMOTE_EOF'
cd /home/administrator/Intranet
chmod +x server-deploy.sh
./server-deploy.sh
REMOTE_EOF

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   Frontend: http://172.171.244.92:8080"
echo "   Backend: http://172.171.244.92:8001"
