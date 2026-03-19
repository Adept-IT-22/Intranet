#!/bin/bash

# Azure App Service startup script for Django application

echo "Starting Django application..."

# Install any additional dependencies if needed
pip install gunicorn dj-database-url

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --settings=backend.settings_azure

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --settings=backend.settings_azure

# Start the application with gunicorn
echo "Starting gunicorn server..."
gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 600 backend.wsgi:application
