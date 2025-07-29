from django.urls import path
from apps.payments.views import (
    PaymentInitializationView,
    PaymentVerificationView,
    PaystackWebhookView,
    TransactionListView,
    PaymentListView,
    PaymentMethodListView,
    WalletView,
    WalletTransactionListView,
    CouponValidationView,
    payment_statistics,
)

app_name = 'payments'

urlpatterns = [
    # Payment processing
    path('initialize/', PaymentInitializationView.as_view(), name='payment_initialize'),
    path('verify/', PaymentVerificationView.as_view(), name='payment_verify'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='paystack_webhook'),
    
    # Transaction management
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    path('payments/', PaymentListView.as_view(), name='payment_list'),
    
    # Payment methods
    path('methods/', PaymentMethodListView.as_view(), name='payment_method_list'),
    
    # Wallet
    path('wallet/', WalletView.as_view(), name='wallet_detail'),
    path('wallet/transactions/', WalletTransactionListView.as_view(), name='wallet_transactions'),
    
    # Coupons
    path('coupons/validate/', CouponValidationView.as_view(), name='coupon_validate'),
    
    # Statistics
    path('statistics/', payment_statistics, name='payment_statistics'),
]
