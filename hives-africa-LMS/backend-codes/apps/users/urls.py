from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.UserViewSet)

app_name = 'users'

urlpatterns = [
    path('api/', include(router.urls)),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]

