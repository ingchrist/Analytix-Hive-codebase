from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.models import TimeStampedModel, UUIDModel
from apps.courses.models import Course, Lesson
import json

User = get_user_model()


class LiveSession(UUIDModel, TimeStampedModel):
    """Live class session model"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='live_sessions')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='live_sessions')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_sessions')
    
    # Session timing
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    
    # Session settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    max_participants = models.PositiveIntegerField(default=100)
    allow_recording = models.BooleanField(default=True)
    auto_record = models.BooleanField(default=False)
    
    # Recording info
    recording_url = models.URLField(blank=True)
    recording_duration = models.PositiveIntegerField(default=0, help_text="Duration in seconds")
    
    # WebRTC room settings
    room_id = models.CharField(max_length=100, unique=True, blank=True)
    
    # Session metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['scheduled_start']
        indexes = [
            models.Index(fields=['course', 'status']),
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['scheduled_start']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_start}"
    
    def save(self, *args, **kwargs):
        if not self.room_id:
            import uuid
            self.room_id = str(uuid.uuid4())
        super().save(*args, **kwargs)
    
    @property
    def is_live(self):
        return self.status == 'live'
    
    @property
    def is_upcoming(self):
        return self.status == 'scheduled' and self.scheduled_start > timezone.now()
    
    @property
    def duration_minutes(self):
        if self.actual_start and self.actual_end:
            delta = self.actual_end - self.actual_start
            return int(delta.total_seconds() / 60)
        return 0
    
    def start_session(self):
        """Mark session as live"""
        self.status = 'live'
        self.actual_start = timezone.now()
        self.save()
    
    def end_session(self):
        """Mark session as ended"""
        self.status = 'ended'
        self.actual_end = timezone.now()
        self.save()


class SessionParticipant(UUIDModel, TimeStampedModel):
    """Track participants in live sessions"""
    ROLE_CHOICES = [
        ('instructor', 'Instructor'),
        ('student', 'Student'),
        ('moderator', 'Moderator'),
        ('observer', 'Observer'),
    ]
    
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_participations')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Participation tracking
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    
    # Permissions
    can_share_screen = models.BooleanField(default=False)
    can_share_audio = models.BooleanField(default=True)
    can_share_video = models.BooleanField(default=True)
    can_chat = models.BooleanField(default=True)
    
    # Connection info
    peer_id = models.CharField(max_length=100, blank=True)
    
    class Meta:
        unique_together = ['session', 'user']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.session.title}"
    
    @property
    def duration_minutes(self):
        if self.joined_at:
            end_time = self.left_at or timezone.now()
            delta = end_time - self.joined_at
            return int(delta.total_seconds() / 60)
        return 0
    
    def join(self):
        """Mark participant as joined"""
        self.joined_at = timezone.now()
        self.is_online = True
        self.save()
    
    def leave(self):
        """Mark participant as left"""
        self.left_at = timezone.now()
        self.is_online = False
        self.save()


class WebRTCSignal(UUIDModel, TimeStampedModel):
    """Store WebRTC signaling data"""
    SIGNAL_TYPES = [
        ('offer', 'Offer'),
        ('answer', 'Answer'),
        ('ice_candidate', 'ICE Candidate'),
        ('join', 'Join'),
        ('leave', 'Leave'),
    ]
    
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='signals')
    from_participant = models.ForeignKey(
        SessionParticipant, 
        on_delete=models.CASCADE, 
        related_name='sent_signals'
    )
    to_participant = models.ForeignKey(
        SessionParticipant, 
        on_delete=models.CASCADE, 
        related_name='received_signals',
        null=True, 
        blank=True
    )
    
    signal_type = models.CharField(max_length=20, choices=SIGNAL_TYPES)
    signal_data = models.JSONField()
    
    # Processing status
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'signal_type']),
            models.Index(fields=['from_participant', 'signal_type']),
        ]
    
    def __str__(self):
        return f"{self.signal_type} from {self.from_participant.user.username}"


class SessionRecording(UUIDModel, TimeStampedModel):
    """Store session recording information"""
    session = models.OneToOneField(LiveSession, on_delete=models.CASCADE, related_name='recording')
    
    # Recording files
    video_file = models.FileField(upload_to='recordings/videos/', blank=True, null=True)
    audio_file = models.FileField(upload_to='recordings/audio/', blank=True, null=True)
    
    # External recording URLs (if using third-party recording service)
    video_url = models.URLField(blank=True)
    audio_url = models.URLField(blank=True)
    
    # Recording metadata
    duration_seconds = models.PositiveIntegerField(default=0)
    file_size_bytes = models.PositiveBigIntegerField(default=0)
    format = models.CharField(max_length=10, default='mp4')
    quality = models.CharField(max_length=20, default='720p')
    
    # Processing status
    is_processing = models.BooleanField(default=False)
    is_ready = models.BooleanField(default=False)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Access control
    is_public = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Recording for {self.session.title}"


class SessionChat(UUIDModel, TimeStampedModel):
    """Chat messages during live sessions"""
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='chat_messages')
    participant = models.ForeignKey(SessionParticipant, on_delete=models.CASCADE, related_name='chat_messages')
    
    message = models.TextField()
    is_private = models.BooleanField(default=False)  # Private message to instructor
    
    # Message status
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.participant.user.username}: {self.message[:50]}"


class SessionResource(UUIDModel, TimeStampedModel):
    """Resources shared during live sessions"""
    session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='resources')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_resources')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='session_resources/')
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveBigIntegerField()
    
    # Sharing settings
    is_downloadable = models.BooleanField(default=True)
    shared_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-shared_at']
    
    def __str__(self):
        return f"{self.title} - {self.session.title}"
