import json
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, RoomMembership, MessageReadReceipt, UserPresence
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Check if user is a member of the room
        is_member = await self.check_membership()
        if not is_member:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Set user online status
        await self.set_user_online(True)
        
        await self.accept()
        
        # Send user joined notification
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': str(self.user.id),
                'username': self.user.username
            }
        )
        
        # Send recent messages
        recent_messages = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'message_history',
            'messages': recent_messages
        }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Set user offline status
        await self.set_user_online(False)
        
        # Send user left notification
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_leave',
                'user_id': str(self.user.id),
                'username': self.user.username
            }
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
            elif message_type == 'delete_message':
                await self.handle_delete_message(data)
            elif message_type == 'edit_message':
                await self.handle_edit_message(data)
        except json.JSONDecodeError:
            await self.send_error("Invalid message format")
    
    async def handle_chat_message(self, data):
        message_content = data.get('message')
        reply_to_id = data.get('reply_to')
        
        if not message_content:
            await self.send_error("Message content is required")
            return
        
        # Save message to database
        message = await self.save_message(message_content, reply_to_id)
        
        # Broadcast message to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': await self.serialize_message(message)
            }
        )
    
    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': str(self.user.id),
                'username': self.user.username,
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        message_id = data.get('message_id')
        
        if message_id:
            await self.mark_message_as_read(message_id)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'message_id': message_id,
                    'user_id': str(self.user.id),
                    'username': self.user.username
                }
            )
    
    async def handle_delete_message(self, data):
        message_id = data.get('message_id')
        
        success = await self.delete_message(message_id)
        
        if success:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_deleted',
                    'message_id': message_id,
                    'deleted_by': str(self.user.id)
                }
            )
    
    async def handle_edit_message(self, data):
        message_id = data.get('message_id')
        new_content = data.get('content')
        
        message = await self.edit_message(message_id, new_content)
        
        if message:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_edited',
                    'message': await self.serialize_message(message)
                }
            )
    
    # Event handlers for group messages
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))
    
    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username']
        }))
    
    async def user_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id'],
            'username': event['username']
        }))
    
    async def typing_indicator(self, event):
        # Don't send typing indicator to the sender
        if event['user_id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))
    
    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'username': event['username']
        }))
    
    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'deleted_by': event['deleted_by']
        }))
    
    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message': event['message']
        }))
    
    # Database operations
    @database_sync_to_async
    def check_membership(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.is_member(self.user)
        except ChatRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, content, reply_to_id=None):
        room = ChatRoom.objects.get(id=self.room_id)
        
        message = Message.objects.create(
            room=room,
            sender=self.user,
            content=content,
            reply_to_id=reply_to_id
        )
        
        # Update last read for sender
        membership = RoomMembership.objects.get(user=self.user, room=room)
        membership.mark_as_read()
        
        return message
    
    @database_sync_to_async
    def serialize_message(self, message):
        return {
            'id': str(message.id),
            'sender': {
                'id': str(message.sender.id),
                'username': message.sender.username,
                'full_name': message.sender.get_full_name()
            },
            'content': message.content,
            'message_type': message.message_type,
            'created_at': message.created_at.isoformat(),
            'is_edited': message.is_edited,
            'edited_at': message.edited_at.isoformat() if message.edited_at else None,
            'reply_to': str(message.reply_to_id) if message.reply_to_id else None
        }
    
    @database_sync_to_async
    def get_recent_messages(self, limit=50):
        room = ChatRoom.objects.get(id=self.room_id)
        messages = room.messages.filter(is_deleted=False).order_by('-created_at')[:limit]
        
        return [
            {
                'id': str(msg.id),
                'sender': {
                    'id': str(msg.sender.id) if msg.sender else None,
                    'username': msg.sender.username if msg.sender else 'System',
                    'full_name': msg.sender.get_full_name() if msg.sender else 'System'
                },
                'content': msg.content,
                'message_type': msg.message_type,
                'created_at': msg.created_at.isoformat(),
                'is_edited': msg.is_edited,
                'edited_at': msg.edited_at.isoformat() if msg.edited_at else None,
                'reply_to': str(msg.reply_to_id) if msg.reply_to_id else None
            }
            for msg in reversed(messages)
        ]
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.mark_as_read_by(self.user)
            return True
        except Message.DoesNotExist:
            return False
    
    @database_sync_to_async
    def delete_message(self, message_id):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.soft_delete()
            return True
        except Message.DoesNotExist:
            return False
    
    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.edit(new_content)
            return message
        except Message.DoesNotExist:
            return None
    
    @database_sync_to_async
    def set_user_online(self, is_online):
        presence, created = UserPresence.objects.get_or_create(user=self.user)
        presence.is_online = is_online
        presence.save()
    
    async def send_error(self, error_message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))

