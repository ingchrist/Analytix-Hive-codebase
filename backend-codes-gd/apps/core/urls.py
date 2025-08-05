from django.urls import path
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'core'})

urlpatterns = [
    path('health/', health_check, name='core_health'),
]