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
echo "🌐 Frontend: http://192.168.1.154:8080"
echo "🔗 Backend API: http://192.168.1.154:8001/api/"
