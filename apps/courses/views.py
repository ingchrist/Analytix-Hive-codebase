from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Courses
    path('', views.CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<slug:slug>/enroll/', views.EnrollCourseView.as_view(), name='course-enroll'),
    path('<slug:slug>/reviews/', views.CourseReviewsView.as_view(), name='course-reviews'),
    path('<slug:slug>/progress/', views.course_progress, name='course-progress'),
    
    # My Courses
    path('my/enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
]

