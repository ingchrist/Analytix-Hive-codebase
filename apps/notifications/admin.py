from django.contrib import admin
from .models import (
    NotificationType, Notification, NotificationPreference,
    NotificationTypePreference, NotificationBatch, EmailTemplate, PushDevice
)


@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'send_email_default', 'send_push_default']
    list_filter = ['is_active', 'send_email_default', 'send_push_default']
    search_fields = ['code', 'name', 'description']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['priority', 'is_read', 'is_seen', 'notification_type', 'created_at']
    search_fields = ['title', 'message', 'recipient__username', 'recipient__email']
    readonly_fields = ['created_at', 'updated_at', 'read_at', 'seen_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'recipient', 'notification_type'
        )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_enabled', 'push_enabled', 'email_frequency']
    list_filter = ['email_enabled', 'push_enabled', 'email_frequency']
    search_fields = ['user__username', 'user__email']


@admin.register(NotificationBatch)
class NotificationBatchAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'total_recipients', 'sent_count', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'message']
    filter_horizontal = ['recipients']


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'subject']


@admin.register(PushDevice)
class PushDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_type', 'device_name', 'is_active', 'last_used']
    list_filter = ['device_type', 'is_active']
    search_fields = ['user__username', 'device_name']

