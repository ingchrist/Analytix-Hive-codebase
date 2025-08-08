from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.models import TimeStampedModel, UUIDModel
from apps.courses.models import Course, Enrollment
from decimal import Decimal
import secrets

User = get_user_model()


class PaymentMethod(UUIDModel, TimeStampedModel):
    """Store user payment methods for quick checkout"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    authorization_code = models.CharField(max_length=255)
    card_type = models.CharField(max_length=50)
    last4 = models.CharField(max_length=4)
    exp_month = models.CharField(max_length=2)
    exp_year = models.CharField(max_length=4)
    bank = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.card_type} ending in {self.last4}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other methods to non-default
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Transaction(UUIDModel, TimeStampedModel):
    """Base transaction model for all payment types"""
    TRANSACTION_TYPES = [
        ('course_purchase', 'Course Purchase'),
        ('subscription', 'Subscription'),
        ('wallet_topup', 'Wallet Top-up'),
        ('refund', 'Refund'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    reference = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Paystack fields
    paystack_reference = models.CharField(max_length=100, blank=True, db_index=True)
    authorization_code = models.CharField(max_length=100, blank=True)
    
    # Metadata
    gateway_response = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    paid_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reference']),
            models.Index(fields=['paystack_reference']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.reference} ({self.status})"
    
    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self.generate_reference()
        super().save(*args, **kwargs)
    
    def generate_reference(self):
        """Generate unique reference"""
        prefix = self.transaction_type[:3].upper()
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_str = secrets.token_hex(3).upper()
        return f"{prefix}-{timestamp}-{random_str}"


class Payment(UUIDModel, TimeStampedModel):
    """Course payment records"""
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='payment')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments')
    enrollment = models.OneToOneField(Enrollment, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Pricing at time of purchase
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Coupon if used
    coupon_code = models.CharField(max_length=50, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction.user.username} - {self.course.title}"


class Subscription(UUIDModel, TimeStampedModel):
    """Subscription management for premium features"""
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('paused', 'Paused'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Subscription details
    subscription_code = models.CharField(max_length=100, unique=True)
    email_token = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Dates
    start_date = models.DateTimeField(auto_now_add=True)
    next_payment_date = models.DateTimeField()
    cancelled_at = models.DateTimeField(blank=True, null=True)
    
    # Paystack subscription data
    paystack_customer_code = models.CharField(max_length=100, blank=True)
    paystack_subscription_code = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.plan} ({self.status})"
    
    @property
    def is_active(self):
        return self.status == 'active' and self.next_payment_date > timezone.now()


class Wallet(UUIDModel, TimeStampedModel):
    """User wallet for refunds and quick payments"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}"
    
    def credit(self, amount, description=""):
        """Add money to wallet"""
        self.balance += Decimal(str(amount))
        self.save()
        
        WalletTransaction.objects.create(
            wallet=self,
            transaction_type='credit',
            amount=amount,
            balance_after=self.balance,
            description=description
        )
    
    def debit(self, amount, description=""):
        """Remove money from wallet"""
        if self.balance < amount:
            raise ValueError("Insufficient wallet balance")
        
        self.balance -= Decimal(str(amount))
        self.save()
        
        WalletTransaction.objects.create(
            wallet=self,
            transaction_type='debit',
            amount=amount,
            balance_after=self.balance,
            description=description
        )


class WalletTransaction(UUIDModel, TimeStampedModel):
    """Wallet transaction history"""
    TRANSACTION_TYPES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.wallet.user.username} - {self.transaction_type} {self.amount}"


class Coupon(UUIDModel, TimeStampedModel):
    """Discount coupons for courses"""
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.CharField(max_length=255)
    discount_type = models.CharField(
        max_length=10,
        choices=[('fixed', 'Fixed Amount'), ('percentage', 'Percentage')]
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Usage limits
    usage_limit = models.PositiveIntegerField(blank=True, null=True)
    used_count = models.PositiveIntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Restrictions
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    courses = models.ManyToManyField(Course, blank=True, related_name='coupons')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.usage_limit is None or self.used_count < self.usage_limit)
        )
    
    def calculate_discount(self, amount):
        """Calculate discount amount"""
        if self.discount_type == 'fixed':
            return min(self.discount_value, amount)
        else:  # percentage
            return amount * (self.discount_value / 100)

