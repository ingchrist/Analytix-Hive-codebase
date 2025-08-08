from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg, Sum
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404

from apps.courses.models import (
    Category, Course, Section, Lesson, Enrollment, 
    LessonProgress, Review
)
from apps.courses.serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateUpdateSerializer,
    SectionSerializer,
    SectionCreateUpdateSerializer,
    LessonSerializer,
    LessonCreateUpdateSerializer,
    EnrollmentSerializer,
    LessonProgressSerializer,
    ReviewSerializer,
    CourseStatisticsSerializer,
    SearchCourseSerializer,
)


class CategoryListCreateView(generics.ListCreateAPIView):
    """List and create categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Category detail, update, delete"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'


class CourseListCreateView(generics.ListCreateAPIView):
    """List and create courses"""
    queryset = Course.objects.filter(status='published')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'is_free', 'instructor']
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['created_at', 'title', 'price', 'average_rating', 'total_enrollments']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(average_rating__gte=min_rating)
        
        return queryset.select_related('instructor', 'category')
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        # Only instructors and admins can create courses
        if self.request.user.user_type not in ['instructor', 'admin']:
            return Response(
                {'error': 'Only instructors can create courses'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Course detail, update, delete"""
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_update(self, serializer):
        course = self.get_object()
        user = self.request.user
        
        # Only course instructor or admin can update
        if course.instructor != user and user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    def perform_destroy(self, instance):
        user = self.request.user
        
        # Only course instructor or admin can delete
        if instance.instructor != user and user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance.delete()


class InstructorCoursesView(generics.ListAPIView):
    """List instructor's courses"""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'difficulty']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'total_enrollments']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)


class SectionListCreateView(generics.ListCreateAPIView):
    """List and create course sections"""
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Section.objects.filter(course_id=course_id).order_by('order')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SectionCreateUpdateSerializer
        return SectionSerializer
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)
        
        # Check permissions
        if course.instructor != self.request.user and self.request.user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(course=course)


class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Section detail, update, delete"""
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Section.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SectionCreateUpdateSerializer
        return SectionSerializer


class LessonListCreateView(generics.ListCreateAPIView):
    """List and create section lessons"""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        section_id = self.kwargs['section_id']
        return Lesson.objects.filter(section_id=section_id).order_by('order')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LessonCreateUpdateSerializer
        return LessonSerializer
    
    def perform_create(self, serializer):
        section_id = self.kwargs['section_id']
        section = get_object_or_404(Section, id=section_id)
        
        # Check permissions
        if section.course.instructor != self.request.user and self.request.user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(section=section)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Lesson detail, update, delete"""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Lesson.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LessonCreateUpdateSerializer
        return LessonSerializer


class CourseEnrollmentView(APIView):
    """Enroll in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, status='published')
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {'error': 'Already enrolled in this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if course is free or payment is required
        if not course.is_free and course.current_price > 0:
            return Response(
                {'error': 'Payment required for this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=request.user,
            course=course,
            status='active'
        )
        
        # Update course enrollment count
        course.total_enrollments += 1
        course.save()
        
        return Response(
            EnrollmentSerializer(enrollment).data, 
            status=status.HTTP_201_CREATED
        )


class UserEnrollmentsView(generics.ListAPIView):
    """List user's enrollments"""
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'progress_percentage']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)


class LessonProgressView(APIView):
    """Mark lesson as completed/update progress"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {'error': 'Lesson not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is enrolled in course
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=lesson.section.course,
                status='active'
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this course'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create lesson progress
        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={
                'completion_percentage': 100,
                'is_completed': True,
                'time_spent_minutes': request.data.get('time_spent', 0)
            }
        )
        
        if not created:
            # Update existing progress
            progress.is_completed = request.data.get('is_completed', True)
            progress.completion_percentage = request.data.get('completion_percentage', 100)
            progress.time_spent_minutes += request.data.get('time_spent', 0)
            progress.save()
        
        # Update enrollment progress
        self.update_enrollment_progress(enrollment)
        
        return Response(
            LessonProgressSerializer(progress).data, 
            status=status.HTTP_200_OK
        )
    
    def update_enrollment_progress(self, enrollment):
        """Update overall course progress for enrollment"""
        total_lessons = Lesson.objects.filter(
            section__course=enrollment.course,
            is_published=True
        ).count()
        
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
        
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
            enrollment.progress_percentage = round(progress_percentage, 2)
            
            # Mark as completed if 100%
            if progress_percentage >= 100:
                enrollment.status = 'completed'
                enrollment.completed_at = timezone.now()
            
            enrollment.save()


class CourseReviewView(generics.CreateAPIView):
    """Create course review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)
        
        # Check if user is enrolled
        if not Enrollment.objects.filter(
            student=self.request.user, 
            course=course, 
            status__in=['active', 'completed']
        ).exists():
            return Response(
                {'error': 'Must be enrolled to review'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already reviewed
        if Review.objects.filter(student=self.request.user, course=course).exists():
            return Response(
                {'error': 'Already reviewed this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(student=self.request.user, course=course)
        
        # Update course rating
        self.update_course_rating(course)
    
    def update_course_rating(self, course):
        """Update course average rating"""
        reviews = Review.objects.filter(course=course, is_published=True)
        
        if reviews.exists():
            avg_rating = reviews.aggregate(avg=Avg('rating'))['avg']
            course.average_rating = round(avg_rating, 2)
            course.total_reviews = reviews.count()
            course.save()


class CourseSearchView(generics.ListAPIView):
    """Advanced course search"""
    serializer_class = SearchCourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ['title', 'description', 'instructor__first_name', 'instructor__last_name']
    filterset_fields = ['category', 'difficulty', 'is_free']
    ordering_fields = ['created_at', 'title', 'price', 'average_rating']
    
    def get_queryset(self):
        queryset = Course.objects.filter(status='published')
        
        # Advanced filters
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(instructor__first_name__icontains=query) |
                Q(instructor__last_name__icontains=query) |
                Q(category__name__icontains=query)
            )
        
        return queryset.distinct()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_statistics(request):
    """Get course statistics"""
    user = request.user
    
    if user.user_type == 'admin':
        # Admin sees all statistics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(status='published').count()
        draft_courses = Course.objects.filter(status='draft').count()
        total_enrollments = Enrollment.objects.count()
        
    elif user.user_type == 'instructor':
        # Instructor sees their statistics
        total_courses = Course.objects.filter(instructor=user).count()
        published_courses = Course.objects.filter(instructor=user, status='published').count()
        draft_courses = Course.objects.filter(instructor=user, status='draft').count()
        total_enrollments = Enrollment.objects.filter(course__instructor=user).count()
        
    else:
        # Students see their enrollment statistics
        total_courses = 0
        published_courses = 0
        draft_courses = 0
        total_enrollments = Enrollment.objects.filter(student=user).count()
    
    # Calculate additional metrics
    from apps.payments.models import Payment
    total_revenue = Payment.objects.filter(
        transaction__status='success'
    ).aggregate(
        total=Sum('final_amount')
    )['total'] or 0
    
    avg_rating = Course.objects.filter(
        status='published'
    ).aggregate(
        avg=Avg('average_rating')
    )['avg'] or 0
    
    completed_enrollments = Enrollment.objects.filter(
        status='completed'
    ).count()
    completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
    
    stats = {
        'total_courses': total_courses,
        'published_courses': published_courses,
        'draft_courses': draft_courses,
        'total_enrollments': total_enrollments,
        'total_revenue': total_revenue,
        'average_rating': round(avg_rating, 2),
        'completion_rate': round(completion_rate, 2),
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_courses(request):
    """Get featured courses"""
    courses = Course.objects.filter(
        status='published'
    ).annotate(
        popularity_score=Count('enrollments') + Count('reviews')
    ).order_by('-popularity_score', '-average_rating')[:8]
    
    serializer = CourseListSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def course_recommendations(request, course_id):
    """Get course recommendations based on current course"""
    try:
        current_course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Recommend courses from same category or instructor
    recommendations = Course.objects.filter(
        Q(category=current_course.category) | Q(instructor=current_course.instructor),
        status='published'
    ).exclude(id=course_id).order_by('-average_rating', '-total_enrollments')[:6]
    
    serializer = CourseListSerializer(recommendations, many=True, context={'request': request})
    return Response(serializer.data)
