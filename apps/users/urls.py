from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, auth_views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

app_name = 'users'

urlpatterns = [
    # DRF ViewSet routes
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/registration/', auth_views.register_view, name='auth_register'),
    path('api/auth/login/', auth_views.login_view, name='auth_login'),
    path('api/auth/logout/', auth_views.logout_view, name='auth_logout'),
    path('api/auth/registration/verify-email/', auth_views.verify_email_view, name='auth_verify_email'),
    path('api/auth/registration/resend-email/', auth_views.resend_email_verification_view, name='auth_resend_email'),
    path('api/auth/password/reset/', auth_views.password_reset_view, name='auth_password_reset'),
    
    # User profile endpoints
    path('api/users/me/', auth_views.user_profile_view, name='user_profile'),
    path('api/users/me/update/', auth_views.update_profile_view, name='update_profile'),
    
    # Template views
    path('profile/', views.ProfileView.as_view(), name='profile'),
]

