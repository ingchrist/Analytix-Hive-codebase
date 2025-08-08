from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.courses.models import Course, Lesson, Category
from apps.courses.serializers import CourseSerializer
from apps.users.serializers import UserSerializer
from .models import SearchHistory, PopularSearch, SavedSearch, SearchIndex

User = get_user_model()


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ['id', 'query', 'search_type', 'results_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class PopularSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopularSearch
        fields = ['id', 'query', 'search_count', 'last_searched']
        read_only_fields = ['id', 'search_count', 'last_searched']


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = ['id', 'name', 'query', 'filters', 'notify_new_results', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseSearchResultSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'thumbnail',
            'instructor_name', 'category_name', 'difficulty', 
            'price', 'discount_price', 'is_free', 'average_rating',
            'total_enrollments', 'total_lessons'
        ]


class LessonSearchResultSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='section.course.title', read_only=True)
    course_id = serializers.UUIDField(source='section.course.id', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type',
            'course_title', 'course_id', 'section_title',
            'duration_minutes', 'is_preview'
        ]


class UserSearchResultSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'user_type',
            'profile_picture', 'bio'
        ]


class SearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField(required=True, min_length=2, max_length=255)
    search_type = serializers.ChoiceField(
        choices=['all', 'courses', 'users', 'lessons'],
        default='all'
    )
    
    # Filters for courses
    category = serializers.UUIDField(required=False)
    difficulty = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced'],
        required=False
    )
    is_free = serializers.BooleanField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    min_rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    
    # Filters for users
    user_type = serializers.ChoiceField(
        choices=['student', 'instructor', 'admin'],
        required=False
    )
    
    # Pagination
    page = serializers.IntegerField(default=1, min_value=1)
    page_size = serializers.IntegerField(default=20, min_value=1, max_value=100)


class SearchResponseSerializer(serializers.Serializer):
    courses = CourseSearchResultSerializer(many=True, read_only=True)
    lessons = LessonSearchResultSerializer(many=True, read_only=True)
    users = UserSearchResultSerializer(many=True, read_only=True)
    total_results = serializers.IntegerField(read_only=True)
    
    # Search metadata
    query = serializers.CharField(read_only=True)
    search_type = serializers.CharField(read_only=True)
    filters_applied = serializers.DictField(read_only=True)


class AutocompleteSerializer(serializers.Serializer):
    query = serializers.CharField(required=True, min_length=2, max_length=100)
    limit = serializers.IntegerField(default=10, min_value=1, max_value=50)


class AutocompleteResponseSerializer(serializers.Serializer):
    suggestions = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
    popular_searches = PopularSearchSerializer(many=True, read_only=True)
