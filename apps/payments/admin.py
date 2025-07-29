from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Transaction, Payment, PaymentMethod,
    Subscription, Wallet, WalletTransaction, Coupon
)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'reference', 'user', 'amount', 'transaction_type',
        'status', 'paid_at', 'created_at'
    ]
    list_filter = ['status', 'transaction_type', 'created_at']
    search_fields = ['reference', 'paystack_reference', 'user__email']
    readonly_fields = [
        'reference', 'gateway_response', 'metadata',
        'created_at', 'updated_at'
    ]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'transaction', 'course', 'original_price',
        'discount_amount', 'final_amount', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = [
        'transaction__reference', 'course__title',
        'transaction__user__email'
    ]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'transaction', 'course', 'transaction__user'
        )


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'card_type', 'last4', 'exp_month',
        'exp_year', 'bank', 'is_default', 'is_active'
    ]
    list_filter = ['card_type', 'is_default', 'is_active']
    search_fields = ['user__email', 'last4']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'plan', 'status', 'amount',
        'start_date', 'next_payment_date'
    ]
    list_filter = ['plan', 'status', 'created_at']
    search_fields = ['user__email', 'subscription_code']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'is_active', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['balance']


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'wallet', 'transaction_type', 'amount',
        'balance_after', 'created_at'
    ]
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['wallet__user__email', 'reference']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'description', 'discount_type', 'discount_value',
        'usage_limit', 'used_count', 'is_active', 'valid_until'
    ]
    list_filter = ['discount_type', 'is_active', 'valid_until']
    search_fields = ['code', 'description']
    filter_horizontal = ['courses']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Discount Details', {
            'fields': ('discount_type', 'discount_value', 'minimum_amount')
        }),
        ('Usage Limits', {
            'fields': ('usage_limit', 'used_count')
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Course Restrictions', {
            'fields': ('courses',),
            'classes': ('collapse',)
        }),
    )

