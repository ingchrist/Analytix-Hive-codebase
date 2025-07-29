from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('health/', views.health_check, name='health_check'),
    path('api-info/', views.api_info, name='api_info'),
]

