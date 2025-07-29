from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    UserListView,
    UserDetailView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LogoutView,
    user_stats,
    verify_email,
    instructor_students,
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', UserRegistrationView.as_view(), name='register'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Password management
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/auth/password-reset-confirm/<str:uid>/<str:token>/', 
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User profile
    path('api/users/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/users/verify-email/', verify_email, name='verify_email'),
    
    # User management
    path('api/users/', UserListView.as_view(), name='user_list'),
    path('api/users/<uuid:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('api/users/stats/', user_stats, name='user_stats'),
    
    # Instructor specific
    path('api/users/instructor/students/', instructor_students, name='instructor_students'),
]
