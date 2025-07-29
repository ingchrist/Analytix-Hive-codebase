from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.courses.models import (
    Category, Course, Section, Lesson, Enrollment, 
    LessonProgress, Review
)
from apps.users.serializers import UserListSerializer

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'is_active', 'course_count']
        read_only_fields = ['id', 'slug']
    
    def get_course_count(self, obj):
        return obj.courses.filter(status='published').count()


class LessonSerializer(serializers.ModelSerializer):
    """Lesson serializer"""
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type', 'order',
            'video_file', 'video_url', 'text_content', 'attachments',
            'duration_minutes', 'is_preview', 'is_published', 'is_completed'
        ]
        read_only_fields = ['id']
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user has completed this lesson
            try:
                enrollment = Enrollment.objects.get(
                    student=request.user,
                    course=obj.section.course
                )
                progress = LessonProgress.objects.get(
                    enrollment=enrollment,
                    lesson=obj
                )
                return progress.is_completed
            except (Enrollment.DoesNotExist, LessonProgress.DoesNotExist):
                return False
        return False


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    """Lesson create/update serializer"""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'lesson_type', 'order',
            'video_file', 'video_url', 'text_content', 'attachments',
            'duration_minutes', 'is_preview', 'is_published'
        ]
    
    def validate(self, attrs):
        lesson_type = attrs.get('lesson_type', 'video')
        
        if lesson_type == 'video':
            if not attrs.get('video_file') and not attrs.get('video_url'):
                raise serializers.ValidationError(
                    "Video lessons must have either a video file or video URL"
                )
        elif lesson_type == 'text':
            if not attrs.get('text_content'):
                raise serializers.ValidationError(
                    "Text lessons must have text content"
                )
        
        return attrs


class SectionSerializer(serializers.ModelSerializer):
    """Section serializer with lessons"""
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'title', 'description', 'order', 'is_published',
            'lessons', 'lesson_count', 'total_duration'
        ]
        read_only_fields = ['id']
    
    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()
    
    def get_total_duration(self, obj):
        return obj.lessons.filter(is_published=True).aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0


class SectionCreateUpdateSerializer(serializers.ModelSerializer):
    """Section create/update serializer"""
    
    class Meta:
        model = Section
        fields = ['title', 'description', 'order', 'is_published']


class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer"""
    student = UserListSerializer(read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'student', 'student_name', 'rating', 'title', 
            'comment', 'created_at', 'is_published'
        ]
        read_only_fields = ['id', 'student', 'student_name', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    """Course list serializer (simplified)"""
    instructor = UserListSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    current_price = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'instructor',
            'category', 'thumbnail', 'difficulty', 'duration_hours',
            'price', 'discount_price', 'current_price', 'is_free',
            'total_enrollments', 'average_rating', 'total_reviews',
            'status', 'created_at', 'is_enrolled'
        ]
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(
                student=request.user, 
                status='active'
            ).exists()
        return False


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer"""
    instructor = UserListSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    current_price = serializers.ReadOnlyField()
    total_lessons = serializers.ReadOnlyField()
    total_duration_minutes = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    enrollment_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'instructor', 'category', 'thumbnail', 'preview_video',
            'difficulty', 'duration_hours', 'status', 'price',
            'discount_price', 'current_price', 'is_free', 'max_students',
            'requirements', 'what_you_learn', 'meta_title', 'meta_description',
            'total_enrollments', 'average_rating', 'total_reviews',
            'total_lessons', 'total_duration_minutes', 'sections', 'reviews',
            'created_at', 'updated_at', 'is_enrolled', 'enrollment_progress'
        ]
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(
                student=request.user, 
                status='active'
            ).exists()
        return False
    
    def get_enrollment_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = obj.enrollments.get(
                    student=request.user, 
                    status='active'
                )
                return {
                    'progress_percentage': float(enrollment.progress_percentage),
                    'completed_lessons': enrollment.lesson_progress.filter(
                        is_completed=True
                    ).count(),
                    'total_lessons': obj.total_lessons,
                    'enrollment_date': enrollment.created_at,
                }
            except Enrollment.DoesNotExist:
                pass
        return None


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Course create/update serializer"""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'category',
            'thumbnail', 'preview_video', 'difficulty', 'duration_hours',
            'price', 'discount_price', 'is_free', 'max_students',
            'requirements', 'what_you_learn', 'meta_title', 'meta_description',
            'status'
        ]
    
    def validate(self, attrs):
        if not attrs.get('is_free', False):
            if not attrs.get('price') or attrs.get('price') <= 0:
                raise serializers.ValidationError(
                    "Paid courses must have a valid price"
                )
        
        return attrs
    
    def create(self, validated_data):
        # Set instructor to current user
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment serializer"""
    student = UserListSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'status', 'progress_percentage',
            'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'course', 'created_at', 'updated_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    """Lesson progress serializer"""
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'is_completed', 'completion_percentage',
            'time_spent_minutes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'lesson', 'created_at', 'updated_at']


class CourseStatisticsSerializer(serializers.Serializer):
    """Course statistics serializer"""
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)


class SearchCourseSerializer(serializers.ModelSerializer):
    """Course search result serializer"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    current_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'instructor_name',
            'category_name', 'thumbnail', 'difficulty', 'current_price',
            'is_free', 'average_rating', 'total_enrollments', 'created_at'
        ]
