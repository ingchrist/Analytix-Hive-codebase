from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('course/<uuid:course_id>/', views.CourseAnalyticsView.as_view(), name='course-analytics'),
    path('user/progress/', views.UserProgressListView.as_view(), name='user-progress'),
]

