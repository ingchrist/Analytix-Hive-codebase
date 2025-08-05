
from django.urls import path
from apps.users.views import (
    UserProfileView,
    UserListView,
    UserDetailView,
    verify_email,
    user_stats,
    instructor_students,
)

urlpatterns = [
    # User profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('verify-email/', verify_email, name='verify_email'),
    
    # User management
    path('', UserListView.as_view(), name='user_list'),
    path('<uuid:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('stats/', user_stats, name='user_stats'),
    
    # Instructor specific
    path('instructor/students/', instructor_students, name='instructor_students'),
]
