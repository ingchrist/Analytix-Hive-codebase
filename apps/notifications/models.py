from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from apps.core.models import TimeStampedModel, UUIDModel
import json

User = get_user_model()


class NotificationType(models.Model):
    """Define notification types and their templates"""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Template for notification content
    template = models.TextField(help_text="Use {variable} for dynamic content")
    email_template = models.TextField(blank=True, help_text="Email version of the notification")
    
    # Default settings
    is_active = models.BooleanField(default=True)
    send_email_default = models.BooleanField(default=True)
    send_push_default = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Notification(UUIDModel, TimeStampedModel):
    """Individual notification instances"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Recipient
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Notification type and content
    notification_type = models.ForeignKey(NotificationType, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Related object (optional)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Status tracking
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_seen = models.BooleanField(default=False)
    seen_at = models.DateTimeField(null=True, blank=True)
    
    # Action URL
    action_url = models.CharField(max_length=500, blank=True)
    
    # Email status
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Additional data
    data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', 'created_at']),
            models.Index(fields=['recipient', 'is_seen']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_seen(self):
        if not self.is_seen:
            self.is_seen = True
            self.seen_at = timezone.now()
            self.save(update_fields=['is_seen', 'seen_at'])


class NotificationPreference(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Global settings
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    # Email frequency
    EMAIL_FREQUENCY_CHOICES = [
        ('instant', 'Instant'),
        ('hourly', 'Hourly Digest'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
    ]
    email_frequency = models.CharField(max_length=10, choices=EMAIL_FREQUENCY_CHOICES, default='instant')
    
    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"{self.user.username}'s preferences"


class NotificationTypePreference(models.Model):
    """User preferences for specific notification types"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_type_preferences')
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'notification_type']
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type.name}"


class NotificationBatch(UUIDModel, TimeStampedModel):
    """For sending bulk notifications"""
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.ForeignKey(NotificationType, on_delete=models.SET_NULL, null=True)
    
    # Recipients
    recipients = models.ManyToManyField(User, related_name='notification_batches')
    total_recipients = models.PositiveIntegerField(default=0)
    
    # Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Results
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    
    # Created by
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_batches')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification Batch'
        verbose_name_plural = 'Notification Batches'
    
    def __str__(self):
        return f"{self.title} - {self.status}"


class EmailTemplate(models.Model):
    """Email templates for notifications"""
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=255)
    html_content = models.TextField()
    text_content = models.TextField(blank=True)
    
    # Variables available in template
    available_variables = models.JSONField(default=list, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class PushDevice(UUIDModel, TimeStampedModel):
    """Store push notification device tokens"""
    DEVICE_TYPES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_devices')
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES)
    device_token = models.CharField(max_length=500, unique=True)
    device_name = models.CharField(max_length=255, blank=True)
    
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_used']
    
    def __str__(self):
        return f"{self.user.username} - {self.device_type} - {self.device_name}"

