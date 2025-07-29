from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.live_classes.models import LiveSession, SessionParticipant


@receiver(post_save, sender=LiveSession)
def session_status_changed(sender, instance, created, **kwargs):
    """Handle session status changes"""
    if not created:
        channel_layer = get_channel_layer()
        group_name = f'session_{instance.room_id}'
        
        # Notify participants of status change
        if instance.status == 'live':
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'session_started',
                    'session_id': str(instance.id),
                    'message': 'Session has started'
                }
            )
        elif instance.status == 'ended':
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'session_ended',
                    'session_id': str(instance.id),
                    'message': 'Session has ended'
                }
            )


@receiver(post_save, sender=SessionParticipant)
def participant_joined_left(sender, instance, created, **kwargs):
    """Handle participant join/leave events"""
    channel_layer = get_channel_layer()
    group_name = f'session_{instance.session.room_id}'
    
    if created:
        # Participant joined
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'participant_joined',
                'user_id': instance.user.id,
                'username': instance.user.get_full_name(),
                'role': instance.role
            }
        )
    elif instance.left_at and not instance.is_online:
        # Participant left
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'participant_left',
                'user_id': instance.user.id,
                'username': instance.user.get_full_name()
            }
        )


@receiver(pre_delete, sender=LiveSession)
def session_deleted(sender, instance, **kwargs):
    """Handle session deletion"""
    channel_layer = get_channel_layer()
    group_name = f'session_{instance.room_id}'
    
    # Notify participants that session was deleted
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'session_deleted',
            'session_id': str(instance.id),
            'message': 'Session has been cancelled'
        }
    )
