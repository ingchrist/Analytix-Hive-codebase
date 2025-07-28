from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Course, Section, Lesson, Enrollment, LessonProgress, Review

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'courses_count', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'courses_count', 'created_at']
    
    def get_courses_count(self, obj):
        return obj.courses.filter(status='published').count()


class InstructorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'full_name', 'email', 'profile_picture', 'bio',
            'courses_count'
        ]
        read_only_fields = fields
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_courses_count(self, obj):
        return obj.courses_taught.filter(status='published').count()


class LessonSerializer(serializers.ModelSerializer):
    is_accessible = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type', 'order',
            'duration_minutes', 'is_preview', 'is_published',
            'is_accessible', 'progress', 'video_url', 'created_at'
        ]
        read_only_fields = [
            'id', 'is_accessible', 'progress', 'created_at'
        ]
    
    def get_is_accessible(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.is_preview
        
        # Check if user is enrolled
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=obj.section.course,
            status='active'
        ).exists()
        
        return obj.is_preview or is_enrolled or request.user == obj.section.course.instructor
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=obj.section.course
            )
            progress = LessonProgress.objects.get(
                enrollment=enrollment,
                lesson=obj
            )
            return {
                'is_completed': progress.is_completed,
                'completion_percentage': float(progress.completion_percentage),
                'time_spent_minutes': progress.time_spent_minutes
            }
        except (Enrollment.DoesNotExist, LessonProgress.DoesNotExist):
            return None


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lessons_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'title', 'description', 'order', 'is_published',
            'lessons', 'lessons_count', 'total_duration', 'created_at'
        ]
        read_only_fields = ['id', 'lessons_count', 'total_duration', 'created_at']
    
    def get_lessons_count(self, obj):
        return obj.lessons.filter(is_published=True).count()
    
    def get_total_duration(self, obj):
        total_minutes = sum(
            lesson.duration_minutes for lesson in obj.lessons.filter(is_published=True)
        )
        return total_minutes


class CourseSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'instructor',
            'category', 'thumbnail', 'difficulty', 'duration_hours',
            'price', 'discount_price', 'current_price', 'is_free',
            'total_enrollments', 'average_rating', 'total_reviews',
            'is_enrolled', 'rating', 'total_lessons', 'total_duration',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'total_enrollments', 'average_rating',
            'total_reviews', 'created_at', 'updated_at'
        ]
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return Enrollment.objects.filter(
            student=request.user,
            course=obj,
            status='active'
        ).exists()
    
    def get_rating(self, obj):
        return {
            'average': float(obj.average_rating),
            'total': obj.total_reviews
        }
    
    def get_total_lessons(self, obj):
        return Lesson.objects.filter(
            section__course=obj,
            is_published=True
        ).count()
    
    def get_total_duration(self, obj):
        total_minutes = Lesson.objects.filter(
            section__course=obj,
            is_published=True
        ).aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0
        return total_minutes


class CourseDetailSerializer(CourseSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    requirements = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
    what_you_learn = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
    similar_courses = serializers.SerializerMethodField()
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + [
            'description', 'sections', 'requirements', 'what_you_learn',
            'preview_video', 'similar_courses'
        ]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Convert text fields to lists
        if instance.requirements:
            data['requirements'] = [
                req.strip() for req in instance.requirements.split('\n') if req.strip()
            ]
        else:
            data['requirements'] = []
            
        if instance.what_you_learn:
            data['what_you_learn'] = [
                item.strip() for item in instance.what_you_learn.split('\n') if item.strip()
            ]
        else:
            data['what_you_learn'] = []
        
        return data
    
    def get_similar_courses(self, obj):
        similar = Course.objects.filter(
            category=obj.category,
            status='published'
        ).exclude(id=obj.id).order_by('-average_rating')[:4]
        
        return CourseSerializer(similar, many=True, context=self.context).data


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = serializers.StringRelatedField(read_only=True)
    progress = serializers.SerializerMethodField()
    certificate_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'status', 'progress_percentage',
            'progress', 'created_at', 'completed_at', 'certificate_url'
        ]
        read_only_fields = [
            'id', 'student', 'course', 'progress_percentage',
            'created_at', 'completed_at'
        ]
    
    def get_progress(self, obj):
        total_lessons = Lesson.objects.filter(
            section__course=obj.course,
            is_published=True
        ).count()
        
        completed_lessons = LessonProgress.objects.filter(
            enrollment=obj,
            is_completed=True
        ).count()
        
        return {
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'percentage': float(obj.progress_percentage),
            'status': obj.status
        }
    
    def get_certificate_url(self, obj):
        if obj.status == 'completed' and obj.completed_at:
            # Generate certificate URL
            return f"/api/certificates/{obj.id}/"
        return None


class ReviewSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    is_verified_purchase = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'student', 'course', 'course_title', 'rating',
            'title', 'comment', 'is_verified_purchase', 'helpful_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'student', 'course', 'is_verified_purchase',
            'helpful_count', 'created_at', 'updated_at'
        ]
    
    def get_student(self, obj):
        return {
            'id': str(obj.student.id),
            'username': obj.student.username,
            'full_name': obj.student.get_full_name(),
            'profile_picture': obj.student.profile_picture.url if obj.student.profile_picture else None
        }
    
    def get_is_verified_purchase(self, obj):
        return Enrollment.objects.filter(
            student=obj.student,
            course=obj.course,
            status__in=['active', 'completed']
        ).exists()
    
    def get_helpful_count(self, obj):
        # This would be implemented with a ReviewHelpful model
        return 0
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'is_completed', 'completion_percentage',
            'time_spent_minutes', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for instructors to create/update courses"""
    instructor = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'instructor',
            'category', 'thumbnail', 'preview_video', 'difficulty',
            'duration_hours', 'price', 'discount_price', 'is_free',
            'max_students', 'requirements', 'what_you_learn',
            'meta_title', 'meta_description'
        ]
    
    def validate(self, data):
        if data.get('is_free'):
            data['price'] = 0
            data['discount_price'] = None
        else:
            if not data.get('price') or data['price'] <= 0:
                raise serializers.ValidationError(
                    "Price must be greater than 0 for paid courses"
                )
        
        if data.get('discount_price'):
            if data['discount_price'] >= data.get('price', 0):
                raise serializers.ValidationError(
                    "Discount price must be less than regular price"
                )
        
        return data


class SectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sections"""
    
    class Meta:
        model = Section
        fields = ['title', 'description', 'order', 'is_published']
    
    def validate_order(self, value):
        course_id = self.context.get('course_id')
        if not course_id:
            return value
        
        existing = Section.objects.filter(
            course_id=course_id,
            order=value
        )
        
        if self.instance:
            existing = existing.exclude(id=self.instance.id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f"A section with order {value} already exists in this course"
            )
        
        return value


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating lessons"""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'lesson_type', 'order',
            'video_file', 'video_url', 'text_content', 'attachments',
            'duration_minutes', 'is_preview', 'is_published'
        ]
    
    def validate(self, data):
        lesson_type = data.get('lesson_type', self.instance.lesson_type if self.instance else None)
        
        if lesson_type == 'video':
            if not data.get('video_file') and not data.get('video_url'):
                raise serializers.ValidationError(
                    "Video lessons must have either a video file or URL"
                )
        elif lesson_type == 'text':
            if not data.get('text_content'):
                raise serializers.ValidationError(
                    "Text lessons must have content"
                )
        
        return data


# Bulk operations serializers
class BulkEnrollmentSerializer(serializers.Serializer):
    """For bulk enrolling students"""
    student_emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )
    course_id = serializers.UUIDField()
    send_notification = serializers.BooleanField(default=True)
    
    def validate_course_id(self, value):
        try:
            Course.objects.get(id=value, status='published')
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or not published")
        return value

