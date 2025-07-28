from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import requests
import json
import hashlib
import hmac
from decimal import Decimal

from apps.courses.models import Course, Enrollment
from .models import (
    Transaction, Payment, PaymentMethod, Subscription,
    Wallet, WalletTransaction, Coupon
)
from .serializers import (
    TransactionSerializer, PaymentSerializer, PaymentMethodSerializer,
    InitiatePaymentSerializer, VerifyPaymentSerializer, WalletSerializer,
    CouponSerializer
)
from .utils import PaystackAPI


class InitiatePaymentView(generics.CreateAPIView):
    """Initiate payment for course purchase"""
    serializer_class = InitiatePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course = serializer.validated_data['course']
        coupon_code = serializer.validated_data.get('coupon_code')
        payment_method_id = serializer.validated_data.get('payment_method_id')
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {'error': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate pricing
        original_price = course.current_price
        discount_amount = Decimal('0')
        
        # Apply coupon if provided
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if not coupon.is_valid():
                    return Response(
                        {'error': 'Invalid or expired coupon'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if coupon is valid for this course
                if coupon.courses.exists() and course not in coupon.courses.all():
                    return Response(
                        {'error': 'Coupon not valid for this course'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if original_price < coupon.minimum_amount:
                    return Response(
                        {'error': f'Minimum purchase amount is {coupon.minimum_amount}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                discount_amount = coupon.calculate_discount(original_price)
            except Coupon.DoesNotExist:
                return Response(
                    {'error': 'Invalid coupon code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        final_amount = original_price - discount_amount
        
        # Create transaction
        with transaction.atomic():
            # Create transaction record
            txn = Transaction.objects.create(
                user=request.user,
                amount=final_amount,
                transaction_type='course_purchase',
                ip_address=request.META.get('REMOTE_ADDR'),
                metadata={
                    'course_id': str(course.id),
                    'course_title': course.title,
                    'original_price': str(original_price),
                    'discount_amount': str(discount_amount),
                    'coupon_code': coupon_code or ''
                }
            )
            
            # Create payment record
            payment = Payment.objects.create(
                transaction=txn,
                course=course,
                original_price=original_price,
                discount_amount=discount_amount,
                final_amount=final_amount,
                coupon_code=coupon_code or ''
            )
            
            # Initialize Paystack payment
            paystack = PaystackAPI()
            
            # Prepare payment data
            payment_data = {
                'email': request.user.email,
                'amount': int(final_amount * 100),  # Convert to kobo
                'reference': txn.reference,
                'callback_url': f"{settings.FRONTEND_URL}/payments/verify",
                'metadata': {
                    'transaction_id': str(txn.id),
                    'user_id': str(request.user.id),
                    'course_id': str(course.id)
                }
            }
            
            # Use saved payment method if provided
            if payment_method_id:
                try:
                    payment_method = PaymentMethod.objects.get(
                        id=payment_method_id,
                        user=request.user,
                        is_active=True
                    )
                    payment_data['authorization_code'] = payment_method.authorization_code
                    
                    # Charge authorization
                    response = paystack.charge_authorization(payment_data)
                except PaymentMethod.DoesNotExist:
                    return Response(
                        {'error': 'Invalid payment method'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Initialize new payment
                response = paystack.initialize_transaction(payment_data)
            
            if response['status']:
                txn.paystack_reference = response['data'].get('reference', txn.reference)
                txn.save()
                
                return Response({
                    'status': 'success',
                    'transaction_id': str(txn.id),
                    'reference': txn.reference,
                    'amount': final_amount,
                    'authorization_url': response['data'].get('authorization_url'),
                    'access_code': response['data'].get('access_code')
                }, status=status.HTTP_201_CREATED)
            else:
                txn.status = 'failed'
                txn.gateway_response = json.dumps(response)
                txn.save()
                
                return Response(
                    {'error': 'Payment initialization failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )


class VerifyPaymentView(generics.GenericAPIView):
    """Verify payment after redirect from Paystack"""
    serializer_class = VerifyPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reference = serializer.validated_data['reference']
        
        try:
            txn = Transaction.objects.get(
                reference=reference,
                user=request.user
            )
        except Transaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if txn.status == 'success':
            return Response({
                'status': 'success',
                'message': 'Payment already verified'
            })
        
        # Verify with Paystack
        paystack = PaystackAPI()
        response = paystack.verify_transaction(reference)
        
        if response['status'] and response['data']['status'] == 'success':
            with transaction.atomic():
                # Update transaction
                txn.status = 'success'
                txn.paid_at = timezone.now()
                txn.gateway_response = json.dumps(response['data'])
                txn.authorization_code = response['data'].get('authorization', {}).get('authorization_code', '')
                txn.save()
                
                # Get payment and create enrollment
                payment = txn.payment
                enrollment = Enrollment.objects.create(
                    student=request.user,
                    course=payment.course,
                    status='active'
                )
                
                payment.enrollment = enrollment
                payment.save()
                
                # Update course enrollment count
                payment.course.total_enrollments += 1
                payment.course.save(update_fields=['total_enrollments'])
                
                # Save payment method if new card
                auth_data = response['data'].get('authorization', {})
                if auth_data.get('reusable') and auth_data.get('authorization_code'):
                    PaymentMethod.objects.update_or_create(
                        user=request.user,
                        authorization_code=auth_data['authorization_code'],
                        defaults={
                            'card_type': auth_data.get('card_type', ''),
                            'last4': auth_data.get('last4', ''),
                            'exp_month': auth_data.get('exp_month', ''),
                            'exp_year': auth_data.get('exp_year', ''),
                            'bank': auth_data.get('bank', ''),
                        }
                    )
                
                # Update coupon usage if used
                if payment.coupon_code:
                    try:
                        coupon = Coupon.objects.get(code=payment.coupon_code)
                        coupon.used_count += 1
                        coupon.save()
                    except Coupon.DoesNotExist:
                        pass
                
                return Response({
                    'status': 'success',
                    'message': 'Payment verified successfully',
                    'enrollment_id': str(enrollment.id)
                })
        else:
            txn.status = 'failed'
            txn.gateway_response = json.dumps(response)
            txn.save()
            
            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paystack_webhook(request):
    """Handle Paystack webhooks"""
    # Verify webhook signature
    paystack_signature = request.headers.get('x-paystack-signature')
    if not paystack_signature:
        return HttpResponse(status=400)
    
    # Calculate expected signature
    secret = settings.PAYSTACK_SECRET_KEY.encode('utf-8')
    body = request.body
    expected_signature = hmac.new(secret, body, hashlib.sha512).hexdigest()
    
    if paystack_signature != expected_signature:
        return HttpResponse(status=400)
    
    # Process webhook
    data = json.loads(request.body)
    event = data.get('event')
    
    if event == 'charge.success':
        # Handle successful charge
        reference = data['data']['reference']
        
        try:
            txn = Transaction.objects.get(reference=reference)
            
            if txn.status != 'success':
                with transaction.atomic():
                    # Update transaction
                    txn.status = 'success'
                    txn.paid_at = timezone.now()
                    txn.gateway_response = json.dumps(data['data'])
                    txn.save()
                    
                    # Process based on transaction type
                    if txn.transaction_type == 'course_purchase':
                        payment = txn.payment
                        
                        # Create enrollment if not exists
                        if not payment.enrollment:
                            enrollment = Enrollment.objects.create(
                                student=txn.user,
                                course=payment.course,
                                status='active'
                            )
                            payment.enrollment = enrollment
                            payment.save()
                            
                            # Update course enrollment count
                            payment.course.total_enrollments += 1
                            payment.course.save(update_fields=['total_enrollments'])
        
        except Transaction.DoesNotExist:
            pass
    
    elif event == 'subscription.create':
        # Handle new subscription
        subscription_code = data['data']['subscription_code']
        customer_code = data['data']['customer']['customer_code']
        
        # Create or update subscription record
        # Implementation depends on your subscription model
    
    elif event == 'subscription.disable':
        # Handle subscription cancellation
        subscription_code = data['data']['subscription_code']
        
        try:
            subscription = Subscription.objects.get(
                paystack_subscription_code=subscription_code
            )
            subscription.status = 'cancelled'
            subscription.cancelled_at = timezone.now()
            subscription.save()
        except Subscription.DoesNotExist:
            pass
    
    return HttpResponse(status=200)


class TransactionHistoryView(generics.ListAPIView):
    """User transaction history"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).select_related('payment__course').order_by('-created_at')


class PaymentMethodsView(generics.ListCreateAPIView):
    """Manage user payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(
            user=self.request.user,
            is_active=True
        )


class WalletView(generics.RetrieveAPIView):
    """Get user wallet details"""
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet


class ValidateCouponView(generics.GenericAPIView):
    """Validate coupon code"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        course_id = request.data.get('course_id')
        
        if not code:
            return Response(
                {'error': 'Coupon code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            coupon = Coupon.objects.get(code=code)
            
            if not coupon.is_valid():
                return Response(
                    {'error': 'Invalid or expired coupon'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check course restriction if provided
            if course_id:
                try:
                    course = Course.objects.get(id=course_id)
                    if coupon.courses.exists() and course not in coupon.courses.all():
                        return Response(
                            {'error': 'Coupon not valid for this course'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Calculate discount
                    discount = coupon.calculate_discount(course.current_price)
                    
                    return Response({
                        'valid': True,
                        'code': coupon.code,
                        'discount_type': coupon.discount_type,
                        'discount_value': coupon.discount_value,
                        'discount_amount': discount,
                        'final_price': course.current_price - discount
                    })
                except Course.DoesNotExist:
                    return Response(
                        {'error': 'Course not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            return Response({
                'valid': True,
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
                'description': coupon.description
            })
            
        except Coupon.DoesNotExist:
            return Response(
                {'error': 'Invalid coupon code'},
                status=status.HTTP_400_BAD_REQUEST
            )

