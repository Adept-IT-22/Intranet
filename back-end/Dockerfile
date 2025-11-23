# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Create static files directory
RUN mkdir -p static

# Collect static files
RUN python manage.py collectstatic --noinput --settings=backend.settings_azure

# Expose port 8000
EXPOSE 8000

# Use gunicorn for production
RUN pip install gunicorn

# Default command: run migrations then start server with gunicorn
CMD ["sh", "-c", "python manage.py migrate --settings=backend.settings_azure && gunicorn --bind 0.0.0.0:8000 backend.wsgi:application"]
