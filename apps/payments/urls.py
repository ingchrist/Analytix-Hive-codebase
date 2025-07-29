from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payment operations
    path('initiate/', views.InitiatePaymentView.as_view(), name='initiate-payment'),
    path('verify/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('webhook/', views.paystack_webhook, name='paystack-webhook'),
    
    # Transaction history
    path('transactions/', views.TransactionHistoryView.as_view(), name='transaction-history'),
    
    # Payment methods
    path('methods/', views.PaymentMethodsView.as_view(), name='payment-methods'),
    
    # Wallet
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    
    # Coupons
    path('validate-coupon/', views.ValidateCouponView.as_view(), name='validate-coupon'),
]

