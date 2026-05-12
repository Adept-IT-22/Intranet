"""
Production settings for Django application
"""
import os
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Azure App Service provides the WEBSITE_HOSTNAME environment variable
ALLOWED_HOSTS = [
    'intranet.adept-techno.co.ke',
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

# Azure Blob Storage (optional)
if 'AZURE_STORAGE_ACCOUNT_NAME' in os.environ:
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
    AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = os.environ.get('AZURE_STORAGE_CONTAINER', 'media')

# CORS & CSRF
CORS_ALLOWED_ORIGINS = [
    "https://intranet.adept-techno.co.ke",
    "http://172.171.244.92:8080",
    "http://172.171.244.92:80",
    "http://localhost:8080",
    "http://localhost:80",
    "http://frontend:80",
]

CSRF_TRUSTED_ORIGINS = [
    "https://intranet.adept-techno.co.ke",
    "http://172.171.244.92:8080",
    "http://172.171.244.92:80",
    "http://localhost:8080",
    "http://localhost:80",
    "http://frontend:80",
]

# Proxy settings
SECURE_SSL_REDIRECT = False # Let Nginx handle this
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Security Headers
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Secure Cookies for HTTPS
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True

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
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {module} — {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        # Our Auth0 authentication module — show everything
        'backend.auth0_auth': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
