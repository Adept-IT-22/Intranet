"""
Production settings for Django application
"""
import os
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Azure App Service provides the WEBSITE_HOSTNAME environment variable
ALLOWED_HOSTS = [
    os.environ.get('WEBSITE_HOSTNAME', 'localhost'),
    '*.azurewebsites.net',
    'localhost',
    '127.0.0.1',
    '172.171.244.92',
    'backend',  # Docker container name
    'db',
    '*' # For development/docker flexibility
]

# Database configuration for production
if 'DATABASE_URL' in os.environ:
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
        }
    except ImportError:
        # Fallback to manual configuration if dj_database_url is not available
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('POSTGRES_DB', 'intranetdb'),
                'USER': os.environ.get('POSTGRES_USER', 'intranetuser'),
                'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'intranetpass'),
                'HOST': os.environ.get('POSTGRES_HOST', 'db'),
                'PORT': os.environ.get('POSTGRES_PORT', '5432'),
            }
        }
else:
    # Use PostgreSQL for production
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB', 'intranetdb'),
            'USER': os.environ.get('POSTGRES_USER', 'intranetuser'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'intranetpass'),
            'HOST': os.environ.get('POSTGRES_HOST', 'db'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        }
    }

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "http://172.171.244.92:8080",
    "http://172.171.244.92:80",
    "http://localhost:8080",
    "http://localhost:80",
    "http://frontend:80",  # Docker container name
]

CSRF_TRUSTED_ORIGINS = [
    "http://172.171.244.92:8080",
    "http://172.171.244.92:80",
    "http://localhost:8080",
    "http://localhost:80",
    "http://frontend:80",  # Docker container name
]

# Security settings for production
SECURE_SSL_REDIRECT = False  # Disable for local development
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Cache configuration (Redis)
if 'REDIS_URL' in os.environ:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }

# Channel layers for WebSocket (Redis)
if 'REDIS_URL' in os.environ:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [os.environ.get('REDIS_URL')],
            },
        },
    }
else:
    # Fallback to in-memory for development
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'django.log'),
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
