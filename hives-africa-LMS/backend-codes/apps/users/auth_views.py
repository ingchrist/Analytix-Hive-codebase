from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from allauth.account import app_settings as allauth_settings
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC
from allauth.account.utils import (
    complete_signup,
    perform_login,
    send_email_confirmation,
    user_pk_to_url_str,
    url_str_to_user_pk,
)
from .serializers import UserSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user account
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password1', 'password2']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field.replace("_", " ").title()} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if passwords match
        if data['password1'] != data['password2']:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password1']
        )
        
        # Send email verification if required
        if allauth_settings.EMAIL_VERIFICATION == allauth_settings.EmailVerificationMethod.MANDATORY:
            send_email_confirmation(request, user)
            return Response({
                'detail': 'Verification email sent. Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)
        else:
            # If email verification is not required, activate user immediately
            user.is_active = True
            user.save()
            
            # Create token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'key': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
    except ValidationError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response(
            {'error': 'An error occurred during registration'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user and return authentication token
    """
    try:
        data = request.data
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(request, email=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is not active. Please verify your email.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Login user (for session-based authentication if needed)
        login(request, user)
        
        return Response({
            'key': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response(
            {'error': 'An error occurred during login'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user and delete authentication token
    """
    try:
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        
        # Logout user (for session-based authentication)
        logout(request)
        
        return Response({
            'detail': 'Successfully logged out'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response(
            {'error': 'An error occurred during logout'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    """
    Verify user email with verification key
    """
    try:
        key = request.data.get('key')
        
        if not key:
            return Response(
                {'error': 'Verification key is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Try to get email confirmation
            emailconfirmation = EmailConfirmation.objects.get(key=key)
            user = emailconfirmation.email_address.user
        except EmailConfirmation.DoesNotExist:
            # If not found, try HMAC version
            try:
                emailconfirmation = EmailConfirmationHMAC.from_key(key)
                user = emailconfirmation.email_address.user
            except:
                return Response(
                    {'error': 'Invalid verification key'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Confirm the email
        emailconfirmation.confirm(request)
        
        # Activate user
        user.is_active = True
        user.is_verified = True
        user.save()
        
        # Create token for automatic login
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'detail': 'Email verified successfully',
            'key': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        return Response(
            {'error': 'An error occurred during email verification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_email_verification_view(request):
    """
    Resend email verification
    """
    try:
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user.is_verified:
            return Response(
                {'error': 'Email is already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send email verification
        send_email_confirmation(request, user)
        
        return Response({
            'detail': 'Verification email sent successfully',
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Resend email verification error: {str(e)}")
        return Response(
            {'error': 'An error occurred while sending verification email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_view(request):
    """
    Send password reset email
    """
    try:
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            # TODO: Implement password reset email sending
            # This would typically use Django's built-in password reset functionality
            # or a custom implementation
            
            return Response({
                'detail': 'Password reset email sent successfully',
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal whether the email exists or not for security
            return Response({
                'detail': 'If an account with this email exists, a password reset email has been sent.',
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return Response(
            {'error': 'An error occurred while processing password reset'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    """
    try:
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"User profile error: {str(e)}")
        return Response(
            {'error': 'An error occurred while fetching user profile'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """
    Update current user profile
    """
    try:
        user = request.user
        data = request.data
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone_number', 'bio', 'date_of_birth']
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.save()
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return Response(
            {'error': 'An error occurred while updating profile'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
