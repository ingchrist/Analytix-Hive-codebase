from rest_framework import serializers
from .models import CourseAnalytics, UserProgress
from apps.courses.serializers import CourseSerializer, LessonSerializer


class CourseAnalyticsSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = CourseAnalytics
        fields = [
            'id', 'course', 'course_title', 'enrollments',
            'completion_rate', 'average_time_spent',
            'total_lessons_completed'
        ]


class UserProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    enrollment_id = serializers.CharField(source='enrollment.id', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'enrollment_id', 'lesson', 'lesson_title',
            'is_completed', 'time_spent', 'completion_timestamp'
        ]
        read_only_fields = ['completion_timestamp']

