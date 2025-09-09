# Adept Intranet Makefile
# This Makefile provides convenient commands for running the frontend and backend services

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m

NC := \033[0m # No Color

# Project directories
BACKEND_DIR := Intranet/back-end
FRONTEND_DIR := Intranet/frontend

# Python and Node.js commands
PYTHON := python
PIP := pip
NODE := node
NPM := npm

# Ports
BACKEND_PORT := 8000
FRONTEND_PORT := 5173
REDIS_PORT := 6379

##@ Help
help: ## Display this help message
	@echo "$(BLUE)Adept Intranet Development Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup & Installation
install: install-backend install-frontend ## Install all dependencies
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-backend: ## Install Python backend dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd $(BACKEND_DIR) && $(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend: ## Install Node.js frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && $(NPM) install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

setup: install ## Complete project setup (install dependencies)
	@echo "$(BLUE)Setting up database...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py migrate
	@echo "$(GREEN)✓ Project setup complete$(NC)"

##@ Backend Commands
backend: ## Run Django backend server
	@echo "$(BLUE)Starting Django backend server on port $(BACKEND_PORT)...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py runserver $(BACKEND_PORT)

backend-migrate: ## Run Django database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py migrate
	@echo "$(GREEN)✓ Migrations completed$(NC)"

backend-makemigrations: ## Create new Django migrations
	@echo "$(BLUE)Creating new migrations...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py makemigrations
	@echo "$(GREEN)✓ Migrations created$(NC)"

backend-shell: ## Open Django shell
	cd $(BACKEND_DIR) && $(PYTHON) manage.py shell

backend-superuser: ## Create Django superuser
	cd $(BACKEND_DIR) && $(PYTHON) manage.py createsuperuser

backend-collectstatic: ## Collect static files
	@echo "$(BLUE)Collecting static files...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py collectstatic --noinput
	@echo "$(GREEN)✓ Static files collected$(NC)"

backend-test: ## Run Django tests
	@echo "$(BLUE)Running Django tests...$(NC)"
	cd $(BACKEND_DIR) && $(PYTHON) manage.py test
	@echo "$(GREEN)✓ Tests completed$(NC)"

##@ Frontend Commands
frontend: ## Run Vite frontend development server
	@echo "$(BLUE)Starting Vite frontend server on port $(FRONTEND_PORT)...$(NC)"
	cd $(FRONTEND_DIR) && $(NPM) run dev

frontend-build: ## Build frontend for production
	@echo "$(BLUE)Building frontend for production...$(NC)"
	cd $(FRONTEND_DIR) && $(NPM) run build
	@echo "$(GREEN)✓ Frontend built successfully$(NC)"

frontend-preview: ## Preview production build
	@echo "$(BLUE)Starting preview server...$(NC)"
	cd $(FRONTEND_DIR) && $(NPM) run preview

frontend-test: ## Run frontend tests (if available)
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd $(FRONTEND_DIR) && $(NPM) test || echo "$(YELLOW)No tests configured$(NC)"

##@ Development (Run Both Services)
dev: ## Run both frontend and backend in development mode
	@echo "$(BLUE)Starting development environment...$(NC)"
	@echo "$(YELLOW)Backend will run on http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)Frontend will run on http://localhost:$(FRONTEND_PORT)$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop both services$(NC)"
	@$(MAKE) -j2 backend frontend

dev-background: ## Run both services in background
	@echo "$(BLUE)Starting services in background...$(NC)"
	@$(MAKE) backend &
	@sleep 3
	@$(MAKE) frontend &
	@echo "$(GREEN)✓ Services started in background$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:$(FRONTEND_PORT)$(NC)"

##@ Docker Commands
docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-up: ## Start services with Docker Compose
	@echo "$(BLUE)Starting services with Docker Compose...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started with Docker$(NC)"

docker-down: ## Stop Docker Compose services
	@echo "$(BLUE)Stopping Docker Compose services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

docker-restart: ## Restart Docker Compose services
	@echo "$(BLUE)Restarting Docker Compose services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

docker-clean: ## Clean up Docker containers and images
	@echo "$(BLUE)Cleaning up Docker resources...$(NC)"
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✓ Docker cleanup completed$(NC)"

##@ Database Commands
db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(BLUE)Resetting database...$(NC)"
	cd $(BACKEND_DIR) && rm -f db.sqlite3
	cd $(BACKEND_DIR) && $(PYTHON) manage.py migrate
	@echo "$(GREEN)✓ Database reset completed$(NC)"

db-backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	cd $(BACKEND_DIR) && cp db.sqlite3 db_backup_$$(date +%Y%m%d_%H%M%S).sqlite3
	@echo "$(GREEN)✓ Database backup created$(NC)"

##@ Utility Commands
clean: ## Clean up temporary files and caches
	@echo "$(BLUE)Cleaning up temporary files...$(NC)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	cd $(FRONTEND_DIR) && rm -rf node_modules/.cache
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

status: ## Show status of services
	@echo "$(BLUE)Service Status:$(NC)"
	@echo "Backend (port $(BACKEND_PORT)): $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$(BACKEND_PORT) 2>/dev/null || echo 'Not running')"
	@echo "Frontend (port $(FRONTEND_PORT)): $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$(FRONTEND_PORT) 2>/dev/null || echo 'Not running')"
	@echo "Redis (port $(REDIS_PORT)): $$(redis-cli ping 2>/dev/null || echo 'Not running')"

logs: ## Show logs for running services
	@echo "$(BLUE)Service Logs:$(NC)"
	@echo "$(YELLOW)Note: Use 'make docker-logs' for Docker services$(NC)"

##@ Production Commands
build: frontend-build backend-collectstatic ## Build for production
	@echo "$(GREEN)✓ Production build completed$(NC)"

deploy-check: build backend-test frontend-test ## Run all checks before deployment
	@echo "$(GREEN)✓ All deployment checks passed$(NC)"

##@ Quick Commands
start: dev ## Quick start (alias for dev)
stop: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@pkill -f "python manage.py runserver" || true
	@pkill -f "vite" || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

restart: stop start ## Restart all services

.PHONY: help install install-backend install-frontend setup backend backend-migrate backend-makemigrations backend-shell backend-superuser backend-collectstatic backend-test frontend frontend-build frontend-preview frontend-test dev dev-background docker-build docker-up docker-down docker-logs docker-restart docker-clean db-reset db-backup clean status logs build deploy-check start stop restart
