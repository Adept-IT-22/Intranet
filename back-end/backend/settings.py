from pathlib import Path
import os
import dj_database_url
from corsheaders.defaults import default_headers
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key'  # NEVER share this publicly on GitHub
# Read DEBUG from env; default True for dev, set to False in production
DEBUG = config("DEBUG", default=True, cast=bool)

# ✅ Step 1: ALLOWED_HOSTS from env, e.g. "4.246.200.111,localhost,127.0.0.1"
_allowed_hosts_env = config("ALLOWED_HOSTS", default="")
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()]

# ✅ Step 2: CORS - Allow all origins
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    'Authorization',
    'Content-Type',
]

# ✅ CSRF (only needed if using session auth or cookies)
_csrf_trusted_env = config("CSRF_TRUSTED_ORIGINS", default="")
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_trusted_env.split(",") if o.strip()]

# ✅ Installed apps
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',  
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'channels',
    'backend',
    'chat',
    'documents',
    "events",
    'support',
    'announcements',
    'innovations',
    

    # Third-party
    'corsheaders',
    'rest_framework',
]

# ✅ JWT configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ✅ JWT Token Settings - Very long expiration (1 year) so users stay logged in
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=365),  # 1 year - users stay logged in
    'REFRESH_TOKEN_LIFETIME': timedelta(days=365),  # 1 year
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# ✅ Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Add paths to template dirs here if needed
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database configuration - Use PostgreSQL if DATABASE_URL is set (Render/Production), otherwise SQLite (local dev)
DATABASE_URL = config('DATABASE_URL', default=None)
if DATABASE_URL:
    # Production: Use PostgreSQL from DATABASE_URL (Render, Heroku, etc.)
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Development: Use SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / "db.sqlite3",
        }
    }

ASGI_APPLICATION = 'backend.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(
                config("REDIS_HOST", default="127.0.0.1"),
                config("REDIS_PORT", default=6379, cast=int),
            )],
        },
    },
}


AUTH_USER_MODEL = 'backend.CustomUser'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# ✅ MEDIA for document uploads
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# ✅ STATIC
STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Admins who receive support tickets
ADMIN_EMAILS = ["ann.ndiga@adept-techno.com"]