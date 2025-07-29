from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.courses.models import Course, Enrollment
from apps.core.models import TimeStampedModel, UUIDModel
import json

User = get_user_model()


class ChatRoom(UUIDModel, TimeStampedModel):
    ROOM_TYPES = [
        ('direct', 'Direct Message'),
        ('course', 'Course Chat'),
        ('group', 'Group Chat'),
        ('support', 'Support Chat'),
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='group')
    description = models.TextField(blank=True)
    
    # Relationships
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='chat_rooms', 
        blank=True, 
        null=True
    )
    creator = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_rooms'
    )
    members = models.ManyToManyField(User, through='RoomMembership', related_name='chat_rooms')
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_private = models.BooleanField(default=False)
    max_members = models.PositiveIntegerField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room_type', 'is_active']),
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_room_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while ChatRoom.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    @property
    def member_count(self):
        return self.members.count()
    
    def add_member(self, user, role='member'):
        membership, created = RoomMembership.objects.get_or_create(
            user=user,
            room=self,
            defaults={'role': role}
        )
        return membership
    
    def remove_member(self, user):
        RoomMembership.objects.filter(user=user, room=self).delete()
    
    def is_member(self, user):
        return self.memberships.filter(user=user).exists()
    
    def get_online_members(self):
        # This would be implemented with Redis to track online status
        return self.members.filter(is_online=True)


class RoomMembership(UUIDModel, TimeStampedModel):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_memberships')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    
    # Notifications
    notifications_enabled = models.BooleanField(default=True)
    last_read_at = models.DateTimeField(auto_now_add=True)
    
    # Permissions
    can_send_messages = models.BooleanField(default=True)
    can_send_files = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'room']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.room.name} as {self.role}"
    
    @property
    def unread_count(self):
        return self.room.messages.filter(created_at__gt=self.last_read_at).exclude(sender=self.user).count()
    
    def mark_as_read(self):
        self.last_read_at = timezone.now()
        self.save(update_fields=['last_read_at'])


class Message(UUIDModel, TimeStampedModel):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('system', 'System'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    
    # Content
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()
    
    # File attachments
    file = models.FileField(upload_to='chat/files/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(blank=True, null=True)
    
    # Message status
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    
    # Reply functionality
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    # Read receipts
    read_by = models.ManyToManyField(User, through='MessageReadReceipt', related_name='read_messages')
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.sender.username if self.sender else 'System'}: {self.content[:50]}"
    
    def mark_as_read_by(self, user):
        MessageReadReceipt.objects.get_or_create(
            message=self,
            user=user
        )
    
    def edit(self, new_content):
        self.content = new_content
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save()
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.content = "This message has been deleted"
        self.save()


class MessageReadReceipt(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='receipts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
    
    def __str__(self):
        return f"{self.user.username} read {self.message.id} at {self.read_at}"


class DirectMessage(UUIDModel, TimeStampedModel):
    """Helper model for direct messaging between two users"""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_user2')
    room = models.OneToOneField(ChatRoom, on_delete=models.CASCADE)
    
    # Block functionality
    user1_blocked = models.BooleanField(default=False)
    user2_blocked = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user1', 'user2']
    
    def __str__(self):
        return f"DM: {self.user1.username} <-> {self.user2.username}"
    
    @classmethod
    def get_or_create_room(cls, user1, user2):
        """Get or create a direct message room between two users"""
        # Ensure consistent ordering
        if user1.id > user2.id:
            user1, user2 = user2, user1
        
        try:
            dm = cls.objects.get(user1=user1, user2=user2)
            return dm.room
        except cls.DoesNotExist:
            # Create room
            room = ChatRoom.objects.create(
                name=f"DM: {user1.username} & {user2.username}",
                room_type='direct',
                is_private=True
            )
            room.add_member(user1)
            room.add_member(user2)
            
            # Create DirectMessage record
            dm = cls.objects.create(
                user1=user1,
                user2=user2,
                room=room
            )
            return room


class UserPresence(models.Model):
    """Track user online status"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='presence')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    status_message = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"

