import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from apps.live_classes.models import LiveSession, SessionParticipant, WebRTCSignal

User = get_user_model()


class LiveSessionConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for live sessions"""
    
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Check if user can join this session
        can_join = await self.check_session_access()
        if not can_join:
            await self.close()
            return
        
        # Join session groups
        self.session_group_name = f'session_{self.session_id}'
        self.user_group_name = f'session_{self.session_id}_user_{self.user.id}'
        self.chat_group_name = f'session_{self.session_id}_chat'
        
        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )
        
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.session_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user.id,
                'username': self.user.get_full_name(),
            }
        )
    
    async def disconnect(self, close_code):
        if hasattr(self, 'session_group_name'):
            # Leave session groups
            await self.channel_layer.group_discard(
                self.session_group_name,
                self.channel_name
            )
            
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
            
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )
            
            # Notify others that user left
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id,
                    'username': self.user.get_full_name(),
                }
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'webrtc_signal':
                await self.handle_webrtc_signal(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'screen_share':
                await self.handle_screen_share(data)
            elif message_type == 'raise_hand':
                await self.handle_raise_hand(data)
            elif message_type == 'permission_change':
                await self.handle_permission_change(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_webrtc_signal(self, data):
        """Handle WebRTC signaling messages"""
        signal_type = data.get('signal_type')
        signal_data = data.get('signal_data')
        target_user_id = data.get('target_user_id')
        
        if target_user_id:
            # Send to specific user
            target_group = f'session_{self.session_id}_user_{target_user_id}'
            await self.channel_layer.group_send(
                target_group,
                {
                    'type': 'webrtc_signal',
                    'signal_type': signal_type,
                    'signal_data': signal_data,
                    'from_user_id': self.user.id,
                }
            )
        else:
            # Broadcast to all participants
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'webrtc_signal',
                    'signal_type': signal_type,
                    'signal_data': signal_data,
                    'from_user_id': self.user.id,
                }
            )
    
    async def handle_chat_message(self, data):
        """Handle chat messages"""
        message = data.get('message')
        is_private = data.get('is_private', False)
        
        # Save message to database
        chat_message = await self.save_chat_message(message, is_private)
        
        if chat_message:
            # Send to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(chat_message.id),
                        'user_id': self.user.id,
                        'username': self.user.get_full_name(),
                        'message': message,
                        'is_private': is_private,
                        'timestamp': chat_message.created_at.isoformat(),
                    }
                }
            )
    
    async def handle_screen_share(self, data):
        """Handle screen sharing events"""
        is_sharing = data.get('is_sharing', False)
        
        await self.channel_layer.group_send(
            self.session_group_name,
            {
                'type': 'screen_share',
                'user_id': self.user.id,
                'username': self.user.get_full_name(),
                'is_sharing': is_sharing,
            }
        )
    
    async def handle_raise_hand(self, data):
        """Handle raise hand events"""
        is_raised = data.get('is_raised', False)
        
        await self.channel_layer.group_send(
            self.session_group_name,
            {
                'type': 'raise_hand',
                'user_id': self.user.id,
                'username': self.user.get_full_name(),
                'is_raised': is_raised,
            }
        )
    
    async def handle_permission_change(self, data):
        """Handle permission changes (instructor only)"""
        is_instructor = await self.check_instructor_permission()
        if not is_instructor:
            return
        
        target_user_id = data.get('target_user_id')
        permissions = data.get('permissions', {})
        
        # Update permissions in database
        await self.update_participant_permissions(target_user_id, permissions)
        
        # Notify target user
        target_group = f'session_{self.session_id}_user_{target_user_id}'
        await self.channel_layer.group_send(
            target_group,
            {
                'type': 'permission_change',
                'permissions': permissions,
            }
        )
    
    # WebSocket event handlers
    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
    
    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
    
    async def webrtc_signal(self, event):
        await self.send(text_data=json.dumps({
            'type': 'webrtc_signal',
            'signal_type': event['signal_type'],
            'signal_data': event['signal_data'],
            'from_user_id': event['from_user_id'],
        }))
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
        }))
    
    async def screen_share(self, event):
        await self.send(text_data=json.dumps({
            'type': 'screen_share',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_sharing': event['is_sharing'],
        }))
    
    async def raise_hand(self, event):
        await self.send(text_data=json.dumps({
            'type': 'raise_hand',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_raised': event['is_raised'],
        }))
    
    async def permission_change(self, event):
        await self.send(text_data=json.dumps({
            'type': 'permission_change',
            'permissions': event['permissions'],
        }))
    
    async def session_ended(self, event):
        await self.send(text_data=json.dumps({
            'type': 'session_ended',
            'message': 'Session has been ended by the instructor',
        }))
    
    # Database operations
    @database_sync_to_async
    def check_session_access(self):
        """Check if user can access this session"""
        try:
            session = LiveSession.objects.get(id=self.session_id)
            
            # Instructor can always join
            if session.instructor == self.user:
                return True
            
            # Check if student is enrolled in course
            from apps.courses.models import Enrollment
            return Enrollment.objects.filter(
                student=self.user,
                course=session.course,
                status='active'
            ).exists()
            
        except LiveSession.DoesNotExist:
            return False
    
    @database_sync_to_async
    def check_instructor_permission(self):
        """Check if user is instructor of this session"""
        try:
            session = LiveSession.objects.get(id=self.session_id)
            return session.instructor == self.user
        except LiveSession.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_chat_message(self, message, is_private):
        """Save chat message to database"""
        try:
            session = LiveSession.objects.get(id=self.session_id)
            participant = SessionParticipant.objects.get(
                session=session,
                user=self.user
            )
            
            from apps.live_classes.models import SessionChat
            return SessionChat.objects.create(
                session=session,
                participant=participant,
                message=message,
                is_private=is_private
            )
        except (LiveSession.DoesNotExist, SessionParticipant.DoesNotExist):
            return None
    
    @database_sync_to_async
    def update_participant_permissions(self, target_user_id, permissions):
        """Update participant permissions"""
        try:
            session = LiveSession.objects.get(id=self.session_id)
            participant = SessionParticipant.objects.get(
                session=session,
                user_id=target_user_id
            )
            
            # Update permissions
            for key, value in permissions.items():
                if hasattr(participant, key):
                    setattr(participant, key, value)
            
            participant.save()
            return True
        except (LiveSession.DoesNotExist, SessionParticipant.DoesNotExist):
            return False
