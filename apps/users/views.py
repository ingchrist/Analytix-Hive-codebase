from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.users.serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserListSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from apps.users.models import UserProfile

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """User registration view"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Send welcome email (async task would be better)
            try:
                send_mail(
                    subject='Welcome to BMad LMS',
                    message=f'Welcome {user.get_full_name()}! Your account has been created successfully.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass  # Don't fail registration if email fails
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"User registration error: {str(e)}")
            
            return Response({
                'error': 'Registration failed. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view - get and update current user"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserSerializer


class UserListView(generics.ListAPIView):
    """List all users (for admin/instructors)"""
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_verified', 'is_active']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins can see all users
        if user.user_type == 'admin':
            return User.objects.all()
        
        # Instructors can see students in their courses
        elif user.user_type == 'instructor':
            from apps.courses.models import Enrollment
            student_ids = Enrollment.objects.filter(
                course__instructor=user
            ).values_list('student_id', flat=True)
            return User.objects.filter(id__in=student_ids)
        
        # Students can only see instructors
        else:
            return User.objects.filter(user_type='instructor', is_active=True)


class UserDetailView(generics.RetrieveAPIView):
    """Get user details by ID"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins can view any user
        if user.user_type == 'admin':
            return User.objects.all()
        
        # Instructors can view students in their courses
        elif user.user_type == 'instructor':
            from apps.courses.models import Enrollment
            student_ids = Enrollment.objects.filter(
                course__instructor=user
            ).values_list('student_id', flat=True)
            return User.objects.filter(id__in=student_ids)
        
        # Students can view instructors and themselves
        else:
            return User.objects.filter(
                models.Q(user_type='instructor', is_active=True) | 
                models.Q(id=user.id)
            )


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Request password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send reset email
            reset_url = f"{settings.SITE_URL}/reset-password/{uid}/{token}/"
            
            context = {
                'user': user,
                'reset_url': reset_url,
                'site_name': settings.SITE_NAME,
            }
            
            try:
                email_body = render_to_string('users/password_reset_email.html', context)
                send_mail(
                    subject='Password Reset Request',
                    message='',
                    html_message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                
                return Response({'message': 'Password reset email sent'})
            except Exception as e:
                return Response(
                    {'error': 'Failed to send email'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uid, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset link'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({'message': 'Password reset successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout user (blacklist refresh token)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'message': 'Successfully logged out'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'verified_users': User.objects.filter(is_verified=True).count(),
        'user_types': {
            'students': User.objects.filter(user_type='student').count(),
            'instructors': User.objects.filter(user_type='instructor').count(),
            'admins': User.objects.filter(user_type='admin').count(),
        }
    }
    
    # Only admins can see all stats
    if user.user_type != 'admin':
        stats = {'message': 'Access denied'}
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_email(request):
    """Verify user email"""
    user = request.user
    
    if user.is_verified:
        return Response({'message': 'Email already verified'})
    
    # In a real implementation, you would send a verification email
    # For now, we'll just mark as verified
    user.is_verified = True
    user.save()
    
    return Response({'message': 'Email verified successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructor_students(request):
    """Get students enrolled in instructor's courses"""
    if request.user.user_type != 'instructor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.courses.models import Enrollment
    
    enrollments = Enrollment.objects.filter(
        course__instructor=request.user,
        status='active'
    ).select_related('student', 'course')
    
    students_data = []
    for enrollment in enrollments:
        student_data = UserListSerializer(enrollment.student).data
        student_data['course'] = enrollment.course.title
        student_data['enrollment_date'] = enrollment.created_at
        student_data['progress'] = enrollment.progress_percentage
        students_data.append(student_data)
    
    return Response(students_data)
