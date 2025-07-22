from .base import *

DEBUG = True

# Debug Toolbar
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    
    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]

# Email Backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable security features in development
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Logging - More verbose in development
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['apps']['level'] = 'DEBUG'
