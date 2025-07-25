from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Notification, NotificationPreference, NotificationTypePreference,
    NotificationType, PushDevice
)

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'priority', 'notification_type',
            'recipient_name', 'action_url', 'is_read', 'is_seen',
            'read_at', 'seen_at', 'time_ago', 'created_at', 'data'
        ]
        read_only_fields = [
            'id', 'recipient_name', 'time_ago', 'created_at'
        ]
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(obj.created_at, timezone.now())


class NotificationMarkSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['read', 'seen'])


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'push_enabled', 'sms_enabled',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'email_frequency'
        ]


class NotificationTypePreferenceSerializer(serializers.ModelSerializer):
    notification_type_name = serializers.CharField(source='notification_type.name', read_only=True)
    notification_type_code = serializers.CharField(source='notification_type.code', read_only=True)
    
    class Meta:
        model = NotificationTypePreference
        fields = [
            'id', 'notification_type', 'notification_type_name',
            'notification_type_code', 'email_enabled', 'push_enabled',
            'sms_enabled', 'in_app_enabled'
        ]
        read_only_fields = ['id', 'notification_type_name', 'notification_type_code']


class PushDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushDevice
        fields = [
            'id', 'device_type', 'device_token', 'device_name',
            'is_active', 'last_used'
        ]
        read_only_fields = ['id', 'last_used']
        extra_kwargs = {
            'device_token': {'write_only': True}
        }


class BulkNotificationSerializer(serializers.Serializer):
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    recipient_groups = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.PrimaryKeyRelatedField(
        queryset=NotificationType.objects.all(),
        required=False
    )
    priority = serializers.ChoiceField(
        choices=['low', 'normal', 'high', 'urgent'],
        default='normal'
    )
    action_url = serializers.CharField(required=False, allow_blank=True)
    schedule_for = serializers.DateTimeField(required=False)
    
    def validate(self, data):
        if not data.get('recipient_ids') and not data.get('recipient_groups'):
            raise serializers.ValidationError(
                "Either recipient_ids or recipient_groups must be provided"
            )
        return data

