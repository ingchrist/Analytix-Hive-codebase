from django.urls import path
from apps.courses.views import (
    CategoryListCreateView,
    CategoryDetailView,
    CourseListCreateView,
    CourseDetailView,
    InstructorCoursesView,
    SectionListCreateView,
    SectionDetailView,
    LessonListCreateView,
    LessonDetailView,
    CourseEnrollmentView,
    UserEnrollmentsView,
    LessonProgressView,
    CourseReviewView,
    CourseSearchView,
    course_statistics,
    featured_courses,
    course_recommendations,
)

app_name = 'courses'

urlpatterns = [
    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category_detail'),
    
    # Courses
    path('', CourseListCreateView.as_view(), name='course_list_create'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course_detail'),
    path('search/', CourseSearchView.as_view(), name='course_search'),
    path('featured/', featured_courses, name='featured_courses'),
    path('<uuid:course_id>/recommendations/', course_recommendations, name='course_recommendations'),
    
    # Instructor courses
    path('instructor/my-courses/', InstructorCoursesView.as_view(), name='instructor_courses'),
    
    # Course structure
    path('<uuid:course_id>/sections/', SectionListCreateView.as_view(), name='section_list_create'),
    path('sections/<uuid:pk>/', SectionDetailView.as_view(), name='section_detail'),
    path('sections/<uuid:section_id>/lessons/', LessonListCreateView.as_view(), name='lesson_list_create'),
    path('lessons/<uuid:pk>/', LessonDetailView.as_view(), name='lesson_detail'),
    
    # Enrollments
    path('<uuid:course_id>/enroll/', CourseEnrollmentView.as_view(), name='course_enroll'),
    path('enrollments/', UserEnrollmentsView.as_view(), name='user_enrollments'),
    
    # Progress tracking
    path('lessons/<uuid:lesson_id>/progress/', LessonProgressView.as_view(), name='lesson_progress'),
    
    # Reviews
    path('<uuid:course_id>/reviews/', CourseReviewView.as_view(), name='course_review'),
    
    # Statistics
    path('statistics/', course_statistics, name='course_statistics'),
]
