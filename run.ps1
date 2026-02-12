# Adept Intranet PowerShell Scripts
# This script provides convenient commands for running the frontend and backend services

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

# Project directories
$BackendDir = "Intranet\back-end"
$FrontendDir = "Intranet\frontend"

# Ports
$BackendPort = 8000
$FrontendPort = 5173
$RedisPort = 6379

function Show-Help {
    Write-Host "Adept Intranet Development Commands" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Usage: .\run.ps1 <command>" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Available Commands:" -ForegroundColor $Blue
    Write-Host "  install          Install all dependencies"
    Write-Host "  install-backend  Install Python backend dependencies"
    Write-Host "  install-frontend Install Node.js frontend dependencies"
    Write-Host "  setup           Complete project setup (install dependencies)"
    Write-Host "  backend         Run Django backend server"
    Write-Host "  frontend        Run Vite frontend development server"
    Write-Host "  dev             Run both frontend and backend in development mode"
    Write-Host "  backend-migrate Run Django database migrations"
    Write-Host "  backend-shell   Open Django shell"
    Write-Host "  backend-test    Run Django tests"
    Write-Host "  frontend-build  Build frontend for production"
    Write-Host "  frontend-preview Preview production build"
    Write-Host "  docker-up       Start services with Docker Compose"
    Write-Host "  docker-down     Stop Docker Compose services"
    Write-Host "  docker-logs     View Docker Compose logs"
    Write-Host "  clean           Clean up temporary files and caches"
    Write-Host "  status          Show status of services"
    Write-Host "  ngrok-backend   Expose backend via ngrok"
    Write-Host "  ngrok-frontend  Expose frontend via ngrok"
    Write-Host "  ngrok-status    Show ngrok tunnel status"
    Write-Host "  ngrok-stop      Stop all ngrok tunnels"
    Write-Host "  stop            Stop all services"
    Write-Host "  help            Show this help message"
}

function Install-Backend {
    Write-Host "Installing backend dependencies..." -ForegroundColor $Blue
    Set-Location $BackendDir
    pip install -r requirements.txt
    Set-Location "..\.."
    Write-Host "✓ Backend dependencies installed" -ForegroundColor $Green
}

function Install-Frontend {
    Write-Host "Installing frontend dependencies..." -ForegroundColor $Blue
    Set-Location $FrontendDir
    npm install
    Set-Location "..\.."
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor $Green
}

function Install-All {
    Install-Backend
    Install-Frontend
    Write-Host "✓ All dependencies installed" -ForegroundColor $Green
}

function Setup-Project {
    Install-All
    Write-Host "Setting up database..." -ForegroundColor $Blue
    Set-Location $BackendDir
    python manage.py migrate
    Set-Location "..\.."
    Write-Host "✓ Project setup complete" -ForegroundColor $Green
}

function Start-Backend {
    Write-Host "Starting Django backend server on port $BackendPort..." -ForegroundColor $Blue
    Set-Location $BackendDir
    python manage.py runserver $BackendPort
}

function Start-Frontend {
    Write-Host "Starting Vite frontend server on port $FrontendPort..." -ForegroundColor $Blue
    Set-Location $FrontendDir
    npm run dev
}

function Start-Dev {
    Write-Host "Starting development environment..." -ForegroundColor $Blue
    Write-Host "Backend will run on http://localhost:$BackendPort" -ForegroundColor $Yellow
    Write-Host "Frontend will run on http://localhost:$FrontendPort" -ForegroundColor $Yellow
    Write-Host "Press Ctrl+C to stop both services" -ForegroundColor $Yellow
    
    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:BackendDir
        python manage.py runserver $using:BackendPort
    }
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in foreground
    try {
        Set-Location $FrontendDir
        npm run dev
    }
    finally {
        # Clean up background job
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
}

function Backend-Migrate {
    Write-Host "Running database migrations..." -ForegroundColor $Blue
    Set-Location $BackendDir
    python manage.py migrate
    Set-Location "..\.."
    Write-Host "✓ Migrations completed" -ForegroundColor $Green
}

function Backend-Shell {
    Set-Location $BackendDir
    python manage.py shell
    Set-Location "..\.."
}

function Backend-Test {
    Write-Host "Running Django tests..." -ForegroundColor $Blue
    Set-Location $BackendDir
    python manage.py test
    Set-Location "..\.."
    Write-Host "✓ Tests completed" -ForegroundColor $Green
}

function Frontend-Build {
    Write-Host "Building frontend for production..." -ForegroundColor $Blue
    Set-Location $FrontendDir
    npm run build
    Set-Location "..\.."
    Write-Host "✓ Frontend built successfully" -ForegroundColor $Green
}

function Frontend-Preview {
    Write-Host "Starting preview server..." -ForegroundColor $Blue
    Set-Location $FrontendDir
    npm run preview
}

function Docker-Up {
    Write-Host "Starting services with Docker Compose..." -ForegroundColor $Blue
    docker-compose up -d
    Write-Host "✓ Services started with Docker" -ForegroundColor $Green
}

function Docker-Down {
    Write-Host "Stopping Docker Compose services..." -ForegroundColor $Blue
    docker-compose down
    Write-Host "✓ Services stopped" -ForegroundColor $Green
}

function Docker-Logs {
    docker-compose logs -f
}

function Clean-Files {
    Write-Host "Cleaning up temporary files..." -ForegroundColor $Blue
    Get-ChildItem -Recurse -Name "*.pyc" | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Recurse -Directory -Name "__pycache__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Recurse -Directory -Name "*.egg-info" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path "$FrontendDir\node_modules\.cache") {
        Remove-Item -Recurse -Force "$FrontendDir\node_modules\.cache" -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Cleanup completed" -ForegroundColor $Green
}

function Show-Status {
    Write-Host "Service Status:" -ForegroundColor $Blue
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:$BackendPort" -TimeoutSec 2 -UseBasicParsing
        Write-Host "Backend (port $BackendPort): Running" -ForegroundColor $Green
    }
    catch {
        Write-Host "Backend (port $BackendPort): Not running" -ForegroundColor $Red
    }
    
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -TimeoutSec 2 -UseBasicParsing
        Write-Host "Frontend (port $FrontendPort): Running" -ForegroundColor $Green
    }
    catch {
        Write-Host "Frontend (port $FrontendPort): Not running" -ForegroundColor $Red
    }
    
    try {
        $redisResponse = Invoke-WebRequest -Uri "http://localhost:$RedisPort" -TimeoutSec 2 -UseBasicParsing
        Write-Host "Redis (port $RedisPort): Running" -ForegroundColor $Green
    }
    catch {
        Write-Host "Redis (port $RedisPort): Not running" -ForegroundColor $Red
    }
}

function Start-NgrokBackend {
    Write-Host "Starting ngrok tunnel for backend on port $BackendPort..." -ForegroundColor $Blue
    Write-Host "Make sure your backend is running first with '.\run.ps1 backend'" -ForegroundColor $Yellow
    ngrok http $BackendPort
}

function Start-NgrokFrontend {
    Write-Host "Starting ngrok tunnel for frontend on port $FrontendPort..." -ForegroundColor $Blue
    Write-Host "Make sure your frontend is running first with '.\run.ps1 frontend'" -ForegroundColor $Yellow
    ngrok http $FrontendPort
}

function Show-NgrokStatus {
    Write-Host "Ngrok tunnel status:" -ForegroundColor $Blue
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
        foreach ($tunnel in $tunnels.tunnels) {
            Write-Host "Tunnel: $($tunnel.name) URL: $($tunnel.public_url)" -ForegroundColor $Green
        }
    }
    catch {
        Write-Host "No ngrok tunnels found or ngrok not running" -ForegroundColor $Yellow
    }
}

function Stop-Ngrok {
    Write-Host "Stopping ngrok tunnels..." -ForegroundColor $Blue
    Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Ngrok tunnels stopped" -ForegroundColor $Green
}

function Stop-All {
    Write-Host "Stopping all services..." -ForegroundColor $Blue
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All services stopped" -ForegroundColor $Green
}

# Main command dispatcher
switch ($Command.ToLower()) {
    "install" { Install-All }
    "install-backend" { Install-Backend }
    "install-frontend" { Install-Frontend }
    "setup" { Setup-Project }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "dev" { Start-Dev }
    "backend-migrate" { Backend-Migrate }
    "backend-shell" { Backend-Shell }
    "backend-test" { Backend-Test }
    "frontend-build" { Frontend-Build }
    "frontend-preview" { Frontend-Preview }
    "docker-up" { Docker-Up }
    "docker-down" { Docker-Down }
    "docker-logs" { Docker-Logs }
    "clean" { Clean-Files }
    "status" { Show-Status }
    "ngrok-backend" { Start-NgrokBackend }
    "ngrok-frontend" { Start-NgrokFrontend }
    "ngrok-status" { Show-NgrokStatus }
    "ngrok-stop" { Stop-Ngrok }
    "stop" { Stop-All }
    "help" { Show-Help }
    default { 
        Write-Host "Unknown command: $Command" -ForegroundColor $Red
        Show-Help 
    }
}









