# 🚀 Manual Server Deployment Guide

## Server Details
- **IP**: 192.168.1.154
- **Username**: administrator
- **Password**: R00t@4321!

## 🔧 Manual Deployment Steps

### Step 1: Connect to Server
```bash
ssh administrator@192.168.1.154
# Password: R00t@4321!
```

### Step 2: Update System & Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install additional dependencies
sudo apt install -y git curl wget python3 python3-pip python3-venv
```

### Step 3: Clone Repository
```bash
# Navigate to home directory
cd /home/administrator

# Clone the repository
git clone https://github.com/Adept-IT-22/Intranet.git
cd Intranet
```

### Step 4: Configure Environment
```bash
# Create environment file
cat > .env << 'EOF'
DJANGO_SETTINGS_MODULE=backend.settings
DJANGO_SECRET_KEY=django-insecure-server-deployment-key-$(date +%s)
DJANGO_DEBUG=False
DATABASE_URL=postgresql://intranetuser:intranetpass@db:5432/intranetdb
REDIS_URL=redis://redis:6379/0
NGROK_FRONTEND_URL=
EOF
```

### Step 5: Start Services
```bash
# Start with Docker Compose
docker-compose up -d --build

# Wait for services to start
sleep 30

# Check status
docker-compose ps
```

### Step 6: Verify Deployment
```bash
# Check if services are running
docker-compose ps

# Check logs if needed
docker-compose logs backend
docker-compose logs frontend
```

## 🌐 Access Your Application

After successful deployment, your application will be available at:

- **Frontend**: http://192.168.1.154:8080
- **Backend API**: http://192.168.1.154:8001
- **Database**: localhost:5433 (PostgreSQL)
- **Redis**: localhost:6379

## 🔍 Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Restart Services
```bash
docker-compose restart
```

### Stop All Services
```bash
docker-compose down
```

### Rebuild Services
```bash
docker-compose down
docker-compose up -d --build
```

## 📊 Service Ports

- **Frontend (Nginx)**: 8080
- **Backend (Django)**: 8001
- **Database (PostgreSQL)**: 5433
- **Redis**: 6379

## 🔐 Security Notes

- Change default passwords in production
- Configure firewall rules
- Use HTTPS in production
- Regular security updates

---

**Ready to deploy?** Follow the manual steps above or use the automated PowerShell script!
