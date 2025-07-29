from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = 'core/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'BMad-Method LMS'
        return context

@api_view(['GET'])
def health_check(request):
    """
    API endpoint for health checks
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'BMad-Method LMS is running successfully'
    })

@api_view(['GET'])
def api_info(request):
    """
    API endpoint that provides basic API information
    """
    return JsonResponse({
        'name': 'BMad-Method LMS API',
        'version': '1.0.0',
        'description': 'Learning Management System API',
        'endpoints': {
            'health': '/api/core/health/',
            'users': '/api/users/',
            'auth': '/api/auth/',
        }
    })

