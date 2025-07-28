# apps/chat/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ChatRoom, RoomMembership, Message, MessageReadStatus, PrivateChat

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for chat contexts"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'avatar']


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer with enhanced features"""
    
    sender = UserMinimalSerializer(read_only=True)
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    is_own_message = serializers.SerializerMethodField()
    formatted_time = serializers.SerializerMethodField()
    reply_to_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'room', 'sender', 'sender_name', 'content', 
            'message_type', 'attachment', 'attachment_name',
            'is_edited', 'edited_at', 'reply_to', 'reply_to_message',
            'is_own_message', 'formatted_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at', 'is_edited', 'edited_at']
    
    def get_is_own_message(self, obj):
        """Check if message belongs to current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False
    
    def get_formatted_time(self, obj):
        """Return formatted time for display"""
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return obj.created_at.strftime('%b %d, %Y')
        elif diff.seconds > 3600:  # More than 1 hour
            return obj.created_at.strftime('%I:%M %p')
        else:
            return obj.created_at.strftime('%I:%M %p')
    
    def get_reply_to_message(self, obj):
        """Get replied message details"""
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'content': obj.reply_to.content[:100] + '...' if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'sender_name': obj.reply_to.sender.get_full_name() or obj.reply_to.sender.email
            }
        return None


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'attachment', 'reply_to']
    
    def validate_content(self, value):
        """Validate message content"""
        if not value.strip() and not self.initial_data.get('attachment'):
            raise serializers.ValidationError("Message content cannot be empty unless there's an attachment.")
        return value.strip()


class RoomMembershipSerializer(serializers.ModelSerializer):
    """Room membership serializer with user details"""
    
    user = UserMinimalSerializer(read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    is_online = serializers.SerializerMethodField()
    time_since_joined = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomMembership
        fields = [
            'id', 'user', 'user_name', 'role', 'joined_at', 
            'is_active', 'last_seen', 'is_muted', 'is_online',
            'time_since_joined'
        ]
        read_only_fields = ['id', 'joined_at']
    
    def get_is_online(self, obj):
        """Check if user is online (last seen within 5 minutes)"""
        if obj.last_seen:
            return (timezone.now() - obj.last_seen).seconds < 300
        return False
    
    def get_time_since_joined(self, obj):
        """Get human readable time since joined"""
        diff = timezone.now() - obj.joined_at
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"


class ChatRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for room listing"""
    
    member_count = serializers.IntegerField(source='member_count', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'room_type', 'course', 
            'course_title', 'member_count', 'last_message', 
            'unread_count', 'is_active', 'created_at'
        ]
    
    def get_last_message(self, obj):
        """Get last message preview"""
        last_msg = obj.last_message
        if last_msg:
            return {
                'content': last_msg.content[:50] + '...' if len(last_msg.content) > 50 else last_msg.content,
                'sender_name': last_msg.sender.get_full_name() or last_msg.sender.email,
                'created_at': last_msg.created_at,
                'message_type': last_msg.message_type
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Get user's last seen time in this room
            try:
                membership = obj.memberships.get(user=request.user, is_active=True)
                if membership.last_seen:
                    return obj.messages.filter(
                        created_at__gt=membership.last_seen
                    ).exclude(sender=request.user).count()
            except RoomMembership.DoesNotExist:
                pass
        return 0


class ChatRoomDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for room details"""
    
    members = RoomMembershipSerializer(source='memberships', many=True, read_only=True)
    recent_messages = serializers.SerializerMethodField()
    member_count = serializers.IntegerField(source='member_count', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'room_type', 'course', 
            'course_title', 'is_active', 'max_members', 
            'allow_file_sharing', 'is_moderated', 'members', 
            'recent_messages', 'member_count', 'is_member', 
            'user_role', 'created_at', 'updated_at'
        ]
    
    def get_recent_messages(self, obj):
        """Get recent messages (last 50)"""
        recent = obj.messages.select_related('sender').order_by('-created_at')[:50]
        return MessageSerializer(reversed(recent), many=True, context=self.context).data
    
    def get_is_member(self, obj):
        """Check if current user is a member"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.memberships.filter(
                user=request.user, 
                is_active=True
            ).exists()
        return False
    
    def get_user_role(self, obj):
        """Get current user's role in the room"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                membership = obj.memberships.get(user=request.user, is_active=True)
                return membership.role
            except RoomMembership.DoesNotExist:
                pass
        return None


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat rooms"""
    
    class Meta:
        model = ChatRoom
        fields = [
            'name', 'description', 'room_type', 'course', 
            'max_members', 'allow_file_sharing', 'is_moderated'
        ]
    
    def validate_name(self, value):
        """Validate room name"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Room name must be at least 3 characters long.")
        return value.strip()
    
    def validate(self, data):
        """Cross-field validation"""
        if data['room_type'] == 'course' and not data.get('course'):
            raise serializers.ValidationError("Course is required for course-based rooms.")
        
        if data['room_type'] != 'course' and data.get('course'):
            raise serializers.ValidationError("Course should only be set for course-based rooms.")
        
        return data


class PrivateChatSerializer(serializers.ModelSerializer):
    """Private chat serializer"""
    
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PrivateChat
        fields = [
            'id', 'other_user', 'last_message', 'unread_count', 
            'created_at', 'updated_at'
        ]
    
    def get_other_user(self, obj):
        """Get the other user in the private chat"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.user2 if obj.user1 == request.user else obj.user1
            return UserMinimalSerializer(other_user).data
        return None
    
    def get_last_message(self, obj):
        """Get last message in private chat"""
        if obj.last_message:
            return MessageSerializer(obj.last_message, context=self.context).data
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # This would need to be implemented based on your read status logic
            return 0  # Placeholder
        return 0

