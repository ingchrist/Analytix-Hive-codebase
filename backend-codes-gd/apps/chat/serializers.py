from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.chat.models import (
    ChatRoom, RoomMembership, Message, MessageReadReceipt, 
    DirectMessage, UserPresence
)
from apps.courses.serializers import CourseListSerializer
from apps.users.serializers import UserListSerializer

User = get_user_model()


class UserPresenceSerializer(serializers.ModelSerializer):
    """User presence serializer"""
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = UserPresence
        fields = [
            'user', 'is_online', 'last_seen', 'status_message'
        ]
        read_only_fields = ['user', 'last_seen']


class RoomMembershipSerializer(serializers.ModelSerializer):
    """Room membership serializer"""
    user = UserListSerializer(read_only=True)
    unread_count = serializers.ReadOnlyField()
    
    class Meta:
        model = RoomMembership
        fields = [
            'id', 'user', 'role', 'notifications_enabled',
            'last_read_at', 'can_send_messages', 'can_send_files',
            'unread_count', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'last_read_at', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    """Chat room serializer"""
    course = CourseListSerializer(read_only=True)
    creator = UserListSerializer(read_only=True)
    member_count = serializers.ReadOnlyField()
    last_message = serializers.SerializerMethodField()
    user_membership = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'slug', 'room_type', 'description',
            'course', 'creator', 'is_active', 'is_private',
            'max_members', 'member_count', 'last_message',
            'user_membership', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'creator', 'member_count', 'created_at', 'updated_at'
        ]
    
    def get_last_message(self, obj):
        last_message = obj.messages.filter(is_deleted=False).last()
        if last_message:
            return {
                'id': str(last_message.id),
                'content': last_message.content,
                'sender': last_message.sender.get_full_name() if last_message.sender else 'System',
                'message_type': last_message.message_type,
                'created_at': last_message.created_at
            }
        return None
    
    def get_user_membership(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                membership = obj.memberships.get(user=request.user)
                return {
                    'role': membership.role,
                    'unread_count': membership.unread_count,
                    'last_read_at': membership.last_read_at,
                    'can_send_messages': membership.can_send_messages,
                    'can_send_files': membership.can_send_files,
                }
            except RoomMembership.DoesNotExist:
                pass
        return None


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """Chat room creation serializer"""
    
    class Meta:
        model = ChatRoom
        fields = [
            'name', 'room_type', 'description', 'course',
            'is_private', 'max_members'
        ]
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class MessageReadReceiptSerializer(serializers.ModelSerializer):
    """Message read receipt serializer"""
    user = UserListSerializer(read_only=True)
    
    class Meta:
        model = MessageReadReceipt
        fields = ['user', 'read_at']


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer"""
    sender = UserListSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField()
    read_receipts = MessageReadReceiptSerializer(source='receipts', many=True, read_only=True)
    is_read_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'content', 'message_type', 'file',
            'file_name', 'file_size', 'reply_to', 'is_edited',
            'edited_at', 'is_deleted', 'deleted_at', 'metadata',
            'read_receipts', 'is_read_by_user', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'sender', 'is_edited', 'edited_at', 'is_deleted',
            'deleted_at', 'created_at', 'updated_at'
        ]
    
    def get_reply_to(self, obj):
        if obj.reply_to and not obj.reply_to.is_deleted:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content,
                'sender': obj.reply_to.sender.get_full_name() if obj.reply_to.sender else 'System',
                'message_type': obj.reply_to.message_type,
                'created_at': obj.reply_to.created_at
            }
        return None
    
    def get_is_read_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.receipts.filter(user=request.user).exists()
        return False


class MessageCreateSerializer(serializers.ModelSerializer):
    """Message creation serializer"""
    reply_to_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Message
        fields = [
            'content', 'message_type', 'file', 'file_name',
            'file_size', 'reply_to_id', 'metadata'
        ]
    
    def validate(self, attrs):
        message_type = attrs.get('message_type', 'text')
        content = attrs.get('content', '')
        file = attrs.get('file')
        
        if message_type == 'text' and not content.strip():
            raise serializers.ValidationError("Text messages must have content")
        
        if message_type in ['image', 'file', 'video', 'audio'] and not file:
            raise serializers.ValidationError(f"{message_type.title()} messages must have a file")
        
        return attrs
    
    def create(self, validated_data):
        reply_to_id = validated_data.pop('reply_to_id', None)
        
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id)
                validated_data['reply_to'] = reply_to
            except Message.DoesNotExist:
                pass
        
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class DirectMessageSerializer(serializers.ModelSerializer):
    """Direct message serializer"""
    user1 = UserListSerializer(read_only=True)
    user2 = UserListSerializer(read_only=True)
    room = ChatRoomSerializer(read_only=True)
    
    class Meta:
        model = DirectMessage
        fields = [
            'id', 'user1', 'user2', 'room', 'user1_blocked',
            'user2_blocked', 'created_at'
        ]
        read_only_fields = ['id', 'user1', 'user2', 'room', 'created_at']


class ChatStatsSerializer(serializers.Serializer):
    """Chat statistics serializer"""
    total_rooms = serializers.IntegerField()
    active_rooms = serializers.IntegerField()
    private_rooms = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    messages_today = serializers.IntegerField()
    active_users = serializers.IntegerField()
    course_rooms = serializers.IntegerField()
    direct_messages = serializers.IntegerField()


class BulkMessageReadSerializer(serializers.Serializer):
    """Bulk message read serializer"""
    message_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )


class RoomSettingsSerializer(serializers.Serializer):
    """Room settings serializer"""
    notifications_enabled = serializers.BooleanField(required=False)
    can_send_messages = serializers.BooleanField(required=False)
    can_send_files = serializers.BooleanField(required=False)


class MessageSearchSerializer(serializers.Serializer):
    """Message search serializer"""
    query = serializers.CharField(max_length=255, required=True)
    room_id = serializers.UUIDField(required=False)
    message_type = serializers.ChoiceField(
        choices=Message.MESSAGE_TYPES,
        required=False
    )
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
