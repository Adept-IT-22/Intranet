from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'rpv5xj12t(fj+$*bno&+j+=)3rcg+%5qhj6j&!iai74ll$udw('
DEBUG = True

ALLOWED_HOSTS = []

# ✅ CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React frontend
]

# You can also temporarily use this instead of CORS_ALLOWED_ORIGINS during local dev:
# CORS_ALLOW_ALL_ORIGINS = True

# ✅ Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',  
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Local apps
    'backend',  # Your app with CustomUser

    # Third-party
    'corsheaders',
]
INSTALLED_APPS += ['rest_framework']

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# ✅ Middleware (cors must come before CommonMiddleware)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 👈 Add this first
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
        'DIRS': [],  # You can put template directories here
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

# ✅ Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

# ✅ Auth
AUTH_USER_MODEL = 'backend.CustomUser'

# ✅ Misc
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

import os
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
