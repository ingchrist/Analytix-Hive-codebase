from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from .models import (
    Notification, NotificationPreference, NotificationTypePreference,
    PushDevice
)
from .serializers import (
    NotificationSerializer, NotificationMarkSerializer,
    NotificationPreferenceSerializer, NotificationTypePreferenceSerializer,
    PushDeviceSerializer, BulkNotificationSerializer
)
from .utils import send_notification


class NotificationListView(generics.ListAPIView):
    """List user notifications with filtering"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user
        ).select_related('notification_type')
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type__code=notification_type)
        
        return queryset


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a notification"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Mark as seen when retrieved
        instance.mark_as_seen()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MarkNotificationsView(APIView):
    """Mark multiple notifications as read or seen"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = NotificationMarkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data['notification_ids']
        action = serializer.validated_data['action']
        
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user
        )
        
        if action == 'read':
            for notification in notifications:
                notification.mark_as_read()
        else:  # seen
            for notification in notifications:
                notification.mark_as_seen()
        
        return Response({
            'status': 'success',
            'updated_count': notifications.count()
        })


class UnreadCountView(APIView):
    """Get unread notification count"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        counts = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).aggregate(
            total=Count('id'),
            high_priority=Count('id', filter=Q(priority='high')),
            urgent=Count('id', filter=Q(priority='urgent'))
        )
        
        return Response(counts)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Get and update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference


class NotificationTypePreferenceView(generics.ListCreateAPIView):
    """Manage notification type preferences"""
    serializer_class = NotificationTypePreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return NotificationTypePreference.objects.filter(
            user=self.request.user
        ).select_related('notification_type')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PushDeviceView(generics.ListCreateAPIView):
    """Register and list push devices"""
    serializer_class = PushDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PushDevice.objects.filter(
            user=self.request.user,
            is_active=True
        )
    
    def perform_create(self, serializer):
        # Deactivate existing device with same token
        PushDevice.objects.filter(
            device_token=serializer.validated_data['device_token']
        ).update(is_active=False)
        
        serializer.save(user=self.request.user)


class SendBulkNotificationView(APIView):
    """Send notifications to multiple users (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        serializer = BulkNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Get recipients
        recipients = []
        if data.get('recipient_ids'):
            recipients = User.objects.filter(id__in=data['recipient_ids'])
        elif data.get('recipient_groups'):
            # Implement group logic based on your requirements
            # e.g., 'students', 'instructors', 'all'
            pass
        
        # Send notifications
        sent_count = 0
        for recipient in recipients:
            notification = send_notification(
                recipient=recipient,
                title=data['title'],
                message=data['message'],
                notification_type=data.get('notification_type'),
                priority=data.get('priority', 'normal'),
                action_url=data.get('action_url', '')
            )
            if notification:
                sent_count += 1
        
        return Response({
            'status': 'success',
            'sent_count': sent_count,
            'total_recipients': recipients.count()
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_notification(request):
    """Send a test notification to the current user"""
    notification = send_notification(
        recipient=request.user,
        title="Test Notification",
        message="This is a test notification from the LMS system.",
        priority='normal',
        action_url='/notifications/'
    )
    
    return Response({
        'status': 'success',
        'notification_id': str(notification.id)
    })

