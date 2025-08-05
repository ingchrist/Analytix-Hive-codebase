from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_health(request):
    return JsonResponse({'status': 'ok', 'message': 'Backend server is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api_health'),
    
    # User authentication API endpoints
    path('api/auth/', include('apps.users.urls')),
    
    # User management API endpoints
    path('api/users/', include('apps.users.user_urls')),
    
    # Core API endpoints  
    path('api/', include('apps.core.urls')),
    
    # Django Allauth (fallback)
    path('accounts/', include('allauth.urls')),
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
