from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from .models import Notification, NotificationPreference, NotificationTypePreference


def send_notification(recipient, title, message, notification_type=None, 
                     priority='normal', action_url='', data=None, 
                     content_object=None):
    """
    Send a notification to a user through multiple channels
    """
    # Create the notification
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        action_url=action_url,
        data=data or {},
        content_object=content_object
    )
    
    # Get user preferences
    prefs, _ = NotificationPreference.objects.get_or_create(user=recipient)
    
    # Check if we should send during quiet hours
    if prefs.quiet_hours_enabled:
        from datetime import datetime
        current_time = datetime.now().time()
        if prefs.quiet_hours_start <= current_time <= prefs.quiet_hours_end:
            return notification
    
    # Send through different channels based on preferences
    if prefs.email_enabled and (prefs.email_frequency == 'instant'):
        send_email_notification(notification)
    
    if prefs.push_enabled:
        send_push_notification(notification)
    
    # Send real-time notification via WebSocket
    send_realtime_notification(notification)
    
    return notification


def send_email_notification(notification):
    """Send email notification"""
    try:
        # Check type-specific preferences
        if notification.notification_type:
            type_pref = NotificationTypePreference.objects.filter(
                user=notification.recipient,
                notification_type=notification.notification_type
            ).first()
            
            if type_pref and not type_pref.email_enabled:
                return
        
        # Prepare email content
        html_message = render_to_string('notifications/email/notification.html', {
            'notification': notification,
            'user': notification.recipient,
            'site_url': settings.SITE_URL
        })
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=notification.title,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.recipient.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        # Mark as sent
        notification.email_sent = True
        notification.email_sent_at = timezone.now()
        notification.save(update_fields=['email_sent', 'email_sent_at'])
        
    except Exception as e:
        # Log the error
        print(f"Failed to send email notification: {e}")


def send_push_notification(notification):
    """Send push notification to user devices"""
    from .models import PushDevice
    
    devices = PushDevice.objects.filter(
        user=notification.recipient,
        is_active=True
    )
    
    for device in devices:
        if device.device_type == 'web':
            # Send web push notification
            send_web_push(device, notification)
        elif device.device_type == 'ios':
            # Send iOS push notification
            send_ios_push(device, notification)
        elif device.device_type == 'android':
            # Send Android push notification
            send_android_push(device, notification)


def send_realtime_notification(notification):
    """Send real-time notification via WebSocket"""
    channel_layer = get_channel_layer()
    
    # Send to user's notification channel
    async_to_sync(channel_layer.group_send)(
        f"notifications_{notification.recipient.id}",
        {
            "type": "notification_message",
            "notification": {
                "id": str(notification.id),
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority,
                "action_url": notification.action_url,
                "created_at": notification.created_at.isoformat(),
            }
        }
    )


def send_web_push(device, notification):
    """Send web push notification"""
    # Implement web push using pywebpush or similar
    pass


def send_ios_push(device, notification):
    """Send iOS push notification"""
    # Implement using APNS
    pass


def send_android_push(device, notification):
    """Send Android push notification"""
    # Implement using FCM
    pass


def create_notification_batch(users, title, message, notification_type=None, **kwargs):
    """Create notifications for multiple users"""
    notifications = []
    
    for user in users:
        notification = send_notification(
            recipient=user,
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
        notifications.append(notification)
    
    return notifications

