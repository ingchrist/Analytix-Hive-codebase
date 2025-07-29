from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import requests
import hmac
import hashlib
import json
from decimal import Decimal

from apps.payments.models import (
    Transaction, Payment, PaymentMethod, Subscription,
    Wallet, WalletTransaction, Coupon
)
from apps.payments.serializers import (
    TransactionSerializer,
    PaymentSerializer,
    PaymentMethodSerializer,
    SubscriptionSerializer,
    WalletSerializer,
    WalletTransactionSerializer,
    CouponSerializer,
    PaymentInitializationSerializer,
    PaymentVerificationSerializer,
)
from apps.courses.models import Course, Enrollment


class PaymentInitializationView(APIView):
    """Initialize payment with Paystack"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PaymentInitializationSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data['course_id']
            coupon_code = serializer.validated_data.get('coupon_code')
            
            try:
                course = Course.objects.get(id=course_id, status='published')
            except Course.DoesNotExist:
                return Response(
                    {'error': 'Course not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already enrolled
            if Enrollment.objects.filter(
                student=request.user, 
                course=course
            ).exists():
                return Response(
                    {'error': 'Already enrolled in this course'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if course is free
            if course.is_free:
                return Response(
                    {'error': 'This course is free, no payment required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate amount with discount/coupon
            original_price = course.current_price
            discount_amount = Decimal('0')
            final_amount = original_price
            
            if coupon_code:
                try:
                    coupon = Coupon.objects.get(
                        code=coupon_code.upper(),
                        is_active=True
                    )
                    if coupon.is_valid() and original_price >= coupon.minimum_amount:
                        if not coupon.courses.exists() or coupon.courses.filter(id=course.id).exists():
                            discount_amount = coupon.calculate_discount(original_price)
                            final_amount = original_price - discount_amount
                            coupon.used_count += 1
                            coupon.save()
                except Coupon.DoesNotExist:
                    return Response(
                        {'error': 'Invalid coupon code'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Create transaction
            transaction_obj = Transaction.objects.create(
                user=request.user,
                amount=final_amount,
                transaction_type='course_purchase',
                metadata={
                    'course_id': str(course.id),
                    'course_title': course.title,
                    'original_price': str(original_price),
                    'discount_amount': str(discount_amount),
                    'coupon_code': coupon_code
                }
            )
            
            # Initialize payment with Paystack
            paystack_data = {
                'email': request.user.email,
                'amount': int(final_amount * 100),  # Convert to kobo
                'reference': transaction_obj.reference,
                'currency': 'NGN',
                'metadata': {
                    'user_id': request.user.id,
                    'course_id': str(course.id),
                    'transaction_id': str(transaction_obj.id),
                }
            }
            
            headers = {
                'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            
            try:
                response = requests.post(
                    'https://api.paystack.co/transaction/initialize',
                    data=json.dumps(paystack_data),
                    headers=headers,
                    timeout=30
                )
                
                response_data = response.json()
                
                if response.status_code == 200 and response_data['status']:
                    # Update transaction with Paystack reference
                    transaction_obj.paystack_reference = response_data['data']['reference']
                    transaction_obj.save()
                    
                    return Response({
                        'status': 'success',
                        'transaction_id': transaction_obj.id,
                        'authorization_url': response_data['data']['authorization_url'],
                        'access_code': response_data['data']['access_code'],
                        'reference': response_data['data']['reference'],
                        'amount': final_amount,
                        'currency': 'NGN'
                    })
                else:
                    return Response(
                        {'error': response_data.get('message', 'Payment initialization failed')},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except requests.RequestException as e:
                return Response(
                    {'error': 'Payment service unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentVerificationView(APIView):
    """Verify payment with Paystack"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PaymentVerificationSerializer(data=request.data)
        if serializer.is_valid():
            reference = serializer.validated_data['reference']
            
            try:
                transaction_obj = Transaction.objects.get(
                    user=request.user,
                    reference=reference,
                    status='pending'
                )
            except Transaction.DoesNotExist:
                return Response(
                    {'error': 'Transaction not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify with Paystack
            headers = {
                'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
            
            try:
                response = requests.get(
                    f'https://api.paystack.co/transaction/verify/{reference}',
                    headers=headers,
                    timeout=30
                )
                
                response_data = response.json()
                
                if response.status_code == 200 and response_data['status']:
                    payment_data = response_data['data']
                    
                    if payment_data['status'] == 'success':
                        with transaction.atomic():
                            # Update transaction
                            transaction_obj.status = 'success'
                            transaction_obj.paystack_reference = payment_data['reference']
                            transaction_obj.authorization_code = payment_data.get('authorization', {}).get('authorization_code', '')
                            transaction_obj.gateway_response = json.dumps(payment_data)
                            transaction_obj.save()
                            
                            # Create payment record
                            course_id = transaction_obj.metadata.get('course_id')
                            course = Course.objects.get(id=course_id)
                            
                            payment = Payment.objects.create(
                                transaction=transaction_obj,
                                course=course,
                                original_price=Decimal(transaction_obj.metadata.get('original_price', '0')),
                                discount_amount=Decimal(transaction_obj.metadata.get('discount_amount', '0')),
                                final_amount=transaction_obj.amount,
                                coupon_code=transaction_obj.metadata.get('coupon_code', '')
                            )
                            
                            # Create enrollment
                            enrollment = Enrollment.objects.create(
                                student=request.user,
                                course=course,
                                status='active'
                            )
                            
                            payment.enrollment = enrollment
                            payment.save()
                            
                            # Update course enrollment count
                            course.total_enrollments += 1
                            course.save()
                            
                            # Save payment method for future use
                            auth_data = payment_data.get('authorization', {})
                            if auth_data:
                                PaymentMethod.objects.update_or_create(
                                    user=request.user,
                                    authorization_code=auth_data.get('authorization_code', ''),
                                    defaults={
                                        'card_type': auth_data.get('card_type', ''),
                                        'last4': auth_data.get('last4', ''),
                                        'exp_month': auth_data.get('exp_month', ''),
                                        'exp_year': auth_data.get('exp_year', ''),
                                        'bank': auth_data.get('bank', ''),
                                    }
                                )
                        
                        return Response({
                            'status': 'success',
                            'message': 'Payment successful',
                            'enrollment_id': enrollment.id,
                            'course_title': course.title
                        })
                    else:
                        transaction_obj.status = 'failed'
                        transaction_obj.gateway_response = json.dumps(payment_data)
                        transaction_obj.save()
                        
                        return Response(
                            {'error': 'Payment failed'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    return Response(
                        {'error': 'Verification failed'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except requests.RequestException:
                return Response(
                    {'error': 'Verification service unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaystackWebhookView(APIView):
    """Handle Paystack webhooks"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Verify webhook signature
        signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE')
        if not signature:
            return Response(
                {'error': 'Missing signature'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payload = request.body
        computed_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        if not hmac.compare_digest(signature, computed_signature):
            return Response(
                {'error': 'Invalid signature'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process webhook
        try:
            data = json.loads(payload)
            event = data.get('event')
            
            if event == 'charge.success':
                self.handle_successful_payment(data['data'])
            elif event == 'charge.failed':
                self.handle_failed_payment(data['data'])
            elif event == 'subscription.create':
                self.handle_subscription_create(data['data'])
            elif event == 'subscription.disable':
                self.handle_subscription_disable(data['data'])
            
            return Response({'status': 'success'})
            
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid JSON'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def handle_successful_payment(self, payment_data):
        """Handle successful payment webhook"""
        reference = payment_data.get('reference')
        
        try:
            transaction_obj = Transaction.objects.get(
                paystack_reference=reference
            )
            
            if transaction_obj.status != 'success':
                transaction_obj.status = 'success'
                transaction_obj.gateway_response = json.dumps(payment_data)
                transaction_obj.save()
                
        except Transaction.DoesNotExist:
            pass
    
    def handle_failed_payment(self, payment_data):
        """Handle failed payment webhook"""
        reference = payment_data.get('reference')
        
        try:
            transaction_obj = Transaction.objects.get(
                paystack_reference=reference
            )
            
            transaction_obj.status = 'failed'
            transaction_obj.gateway_response = json.dumps(payment_data)
            transaction_obj.save()
            
        except Transaction.DoesNotExist:
            pass
    
    def handle_subscription_create(self, subscription_data):
        """Handle subscription creation webhook"""
        # Implementation for subscription webhooks
        pass
    
    def handle_subscription_disable(self, subscription_data):
        """Handle subscription disable webhook"""
        # Implementation for subscription webhooks
        pass


class TransactionListView(generics.ListAPIView):
    """List user transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'transaction_type']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class PaymentListView(generics.ListAPIView):
    """List user payments"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['course']
    ordering_fields = ['created_at', 'final_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Payment.objects.filter(transaction__user=self.request.user)


class PaymentMethodListView(generics.ListCreateAPIView):
    """List and manage payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user, is_active=True)


class WalletView(generics.RetrieveAPIView):
    """Get user wallet"""
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet


class WalletTransactionListView(generics.ListAPIView):
    """List wallet transactions"""
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']
    
    def get_queryset(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return WalletTransaction.objects.filter(wallet=wallet)


class CouponValidationView(APIView):
    """Validate coupon code"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        coupon_code = request.data.get('code', '').upper()
        course_id = request.data.get('course_id')
        
        if not coupon_code:
            return Response(
                {'error': 'Coupon code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            coupon = Coupon.objects.get(code=coupon_code, is_active=True)
        except Coupon.DoesNotExist:
            return Response(
                {'error': 'Invalid coupon code'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not coupon.is_valid():
            return Response(
                {'error': 'Coupon has expired or usage limit exceeded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check course restriction
        if course_id and coupon.courses.exists():
            if not coupon.courses.filter(id=course_id).exists():
                return Response(
                    {'error': 'Coupon not valid for this course'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate discount for given course
        discount_amount = 0
        if course_id:
            try:
                course = Course.objects.get(id=course_id)
                if course.current_price >= coupon.minimum_amount:
                    discount_amount = coupon.calculate_discount(course.current_price)
            except Course.DoesNotExist:
                pass
        
        return Response({
            'valid': True,
            'coupon': CouponSerializer(coupon).data,
            'discount_amount': discount_amount
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_statistics(request):
    """Get payment statistics"""
    user = request.user
    
    if user.user_type == 'admin':
        # Admin sees all statistics
        total_transactions = Transaction.objects.count()
        successful_transactions = Transaction.objects.filter(status='success').count()
        total_revenue = Transaction.objects.filter(status='success').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
    elif user.user_type == 'instructor':
        # Instructor sees their course payment statistics
        total_transactions = Transaction.objects.filter(
            metadata__course_id__in=Course.objects.filter(
                instructor=user
            ).values_list('id', flat=True)
        ).count()
        
        successful_transactions = Transaction.objects.filter(
            status='success',
            metadata__course_id__in=Course.objects.filter(
                instructor=user
            ).values_list('id', flat=True)
        ).count()
        
        total_revenue = Payment.objects.filter(
            course__instructor=user,
            transaction__status='success'
        ).aggregate(
            total=models.Sum('final_amount')
        )['total'] or 0
        
    else:
        # Students see their payment statistics
        total_transactions = Transaction.objects.filter(user=user).count()
        successful_transactions = Transaction.objects.filter(
            user=user, status='success'
        ).count()
        total_revenue = Transaction.objects.filter(
            user=user, status='success'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
    
    stats = {
        'total_transactions': total_transactions,
        'successful_transactions': successful_transactions,
        'failed_transactions': total_transactions - successful_transactions,
        'total_revenue': total_revenue,
        'success_rate': (successful_transactions / total_transactions * 100) if total_transactions > 0 else 0
    }
    
    return Response(stats)
