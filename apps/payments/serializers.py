from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.payments.models import (
    Transaction, Payment, PaymentMethod, Subscription,
    Wallet, WalletTransaction, Coupon
)
from apps.courses.serializers import CourseListSerializer
from apps.users.serializers import UserListSerializer

User = get_user_model()


class TransactionSerializer(serializers.ModelSerializer):
    """Transaction serializer"""
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'reference', 'amount', 'currency',
            'transaction_type', 'status', 'paystack_reference',
            'authorization_code', 'paid_at', 'metadata', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'reference', 'paystack_reference',
            'authorization_code', 'paid_at', 'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    transaction = TransactionSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction', 'course', 'original_price',
            'discount_amount', 'final_amount', 'coupon_code',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Payment method serializer"""
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'authorization_code', 'card_type', 'last4',
            'exp_month', 'exp_year', 'bank', 'is_default',
            'is_active', 'created_at'
        ]
        read_only_fields = [
            'id', 'authorization_code', 'card_type', 'last4',
            'exp_month', 'exp_year', 'bank', 'created_at'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    """Subscription serializer"""
    user = UserListSerializer(read_only=True)
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'plan', 'status', 'subscription_code',
            'amount', 'start_date', 'next_payment_date',
            'cancelled_at', 'is_active', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'subscription_code', 'start_date',
            'cancelled_at', 'created_at'
        ]


class WalletSerializer(serializers.ModelSerializer):
    """Wallet serializer"""
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'user', 'balance', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Wallet transaction serializer"""
    
    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'transaction_type', 'amount', 'balance_after',
            'description', 'reference', 'created_at'
        ]
        read_only_fields = ['id', 'balance_after', 'created_at']


class CouponSerializer(serializers.ModelSerializer):
    """Coupon serializer"""
    courses = CourseListSerializer(many=True, read_only=True)
    is_valid_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type',
            'discount_value', 'usage_limit', 'used_count',
            'valid_from', 'valid_until', 'is_active',
            'minimum_amount', 'courses', 'is_valid_now',
            'created_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at']
    
    def get_is_valid_now(self, obj):
        return obj.is_valid()


class PaymentInitializationSerializer(serializers.Serializer):
    """Payment initialization serializer"""
    course_id = serializers.UUIDField(required=True)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate_course_id(self, value):
        from apps.courses.models import Course
        try:
            course = Course.objects.get(id=value, status='published')
            if course.is_free:
                raise serializers.ValidationError("This course is free")
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found")


class PaymentVerificationSerializer(serializers.Serializer):
    """Payment verification serializer"""
    reference = serializers.CharField(max_length=100, required=True)


class CouponValidationSerializer(serializers.Serializer):
    """Coupon validation serializer"""
    code = serializers.CharField(max_length=50, required=True)
    course_id = serializers.UUIDField(required=False)


class PaymentStatisticsSerializer(serializers.Serializer):
    """Payment statistics serializer"""
    total_transactions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()
    failed_transactions = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    success_rate = serializers.DecimalField(max_digits=5, decimal_places=2)


class RefundRequestSerializer(serializers.Serializer):
    """Refund request serializer"""
    payment_id = serializers.UUIDField(required=True)
    reason = serializers.CharField(max_length=500, required=True)
    
    def validate_payment_id(self, value):
        try:
            payment = Payment.objects.get(id=value)
            if payment.transaction.status != 'success':
                raise serializers.ValidationError("Payment is not eligible for refund")
            return value
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found")


class SubscriptionCreateSerializer(serializers.Serializer):
    """Subscription creation serializer"""
    plan = serializers.ChoiceField(choices=Subscription.PLAN_CHOICES)
    authorization_code = serializers.CharField(max_length=100, required=False)


class WalletTopupSerializer(serializers.Serializer):
    """Wallet top-up serializer"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=100)
    
    def validate_amount(self, value):
        if value < 100:
            raise serializers.ValidationError("Minimum top-up amount is ₦100")
        return value
