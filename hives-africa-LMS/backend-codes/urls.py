from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Custom authentication endpoints (these take precedence)
    path('', include('apps.users.urls')),
    
    # Core API endpoints
    path('api/core/', include('apps.core.urls')),
    path('', include('apps.core.urls')),
    
    # Other app endpoints
    path('api/chat/', include('apps.chat.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/files/', include('apps.files.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/payments/', include('apps.payments.urls')),
    
    # Django Allauth (fallback for any endpoints we don't override)
    path('api/auth/', include('allauth.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

