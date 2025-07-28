from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.courses.models import Course
from apps.courses.serializers import CourseSerializer
from .models import (
    Transaction, Payment, PaymentMethod,
    Subscription, Wallet, WalletTransaction, Coupon
)

User = get_user_model()


class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    course = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'reference', 'user', 'amount', 'currency',
            'transaction_type', 'status', 'course', 'paid_at',
            'created_at'
        ]
    
    def get_course(self, obj):
        if hasattr(obj, 'payment'):
            return {
                'id': str(obj.payment.course.id),
                'title': obj.payment.course.title,
                'slug': obj.payment.course.slug,
                'thumbnail': obj.payment.course.thumbnail.url if obj.payment.course.thumbnail else None
            }
        return None


class PaymentSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction', 'course', 'original_price',
            'discount_amount', 'final_amount', 'coupon_code',
            'created_at'
        ]


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'card_type', 'last4', 'exp_month', 'exp_year',
            'bank', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    course_id = serializers.UUIDField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    payment_method_id = serializers.UUIDField(required=False)
    
    def validate_course_id(self, value):
        try:
            course = Course.objects.get(id=value, status='published')
            if course.is_free:
                raise serializers.ValidationError("This course is free")
            return course
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found")
    
    def to_internal_value(self, data):
        # Convert course_id to course object
        ret = super().to_internal_value(data)
        if 'course_id' in ret:
            ret['course'] = ret.pop('course_id')
        return ret


class VerifyPaymentSerializer(serializers.Serializer):
    reference = serializers.CharField()


class WalletSerializer(serializers.ModelSerializer):
    recent_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'balance', 'is_active', 'recent_transactions',
            'created_at', 'updated_at'
        ]
    
    def get_recent_transactions(self, obj):
        transactions = obj.transactions.all()[:5]
        return WalletTransactionSerializer(transactions, many=True).data


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'transaction_type', 'amount', 'balance_after',
            'description', 'reference', 'created_at'
        ]


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type',
            'discount_value', 'valid_from', 'valid_until',
            'is_valid', 'minimum_amount'
        ]
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'amount', 'start_date',
            'next_payment_date', 'is_active', 'cancelled_at'
        ]

