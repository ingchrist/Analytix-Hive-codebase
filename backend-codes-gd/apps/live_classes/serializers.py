from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.live_classes.models import (
    LiveSession, SessionParticipant, WebRTCSignal, 
    SessionRecording, SessionChat, SessionResource
)
from apps.courses.serializers import CourseListSerializer, LessonSerializer
from apps.users.serializers import UserListSerializer

User = get_user_model()


class LiveSessionSerializer(serializers.ModelSerializer):
    """Live session serializer"""
    instructor = UserListSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    participant_count = serializers.SerializerMethodField()
    is_live = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    can_join = serializers.SerializerMethodField()
    
    class Meta:
        model = LiveSession
        fields = [
            'id', 'title', 'description', 'course', 'lesson', 'instructor',
            'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end',
            'status', 'max_participants', 'allow_recording', 'auto_record',
            'recording_url', 'recording_duration', 'room_id', 'participant_count',
            'is_live', 'is_upcoming', 'duration_minutes', 'can_join', 'created_at'
        ]
        read_only_fields = ['id', 'actual_start', 'actual_end', 'room_id', 'created_at']
    
    def get_participant_count(self, obj):
        return obj.participants.filter(is_online=True).count()
    
    def get_can_join(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Check if user is enrolled in the course or is the instructor
        if obj.instructor == request.user:
            return True
        
        from apps.courses.models import Enrollment
        return Enrollment.objects.filter(
            student=request.user,
            course=obj.course,
            status='active'
        ).exists()


class LiveSessionCreateUpdateSerializer(serializers.ModelSerializer):
    """Live session create/update serializer"""
    
    class Meta:
        model = LiveSession
        fields = [
            'title', 'description', 'course', 'lesson',
            'scheduled_start', 'scheduled_end', 'max_participants',
            'allow_recording', 'auto_record'
        ]
    
    def validate(self, attrs):
        scheduled_start = attrs.get('scheduled_start')
        scheduled_end = attrs.get('scheduled_end')
        
        if scheduled_start and scheduled_end:
            if scheduled_start >= scheduled_end:
                raise serializers.ValidationError(
                    "Session start time must be before end time"
                )
            
            if scheduled_start <= timezone.now():
                raise serializers.ValidationError(
                    "Session start time must be in the future"
                )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)


class SessionParticipantSerializer(serializers.ModelSerializer):
    """Session participant serializer"""
    user = UserListSerializer(read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = SessionParticipant
        fields = [
            'id', 'user', 'role', 'joined_at', 'left_at', 'is_online',
            'can_share_screen', 'can_share_audio', 'can_share_video',
            'can_chat', 'peer_id', 'duration_minutes'
        ]
        read_only_fields = ['id', 'joined_at', 'left_at', 'peer_id']


class WebRTCSignalSerializer(serializers.ModelSerializer):
    """WebRTC signal serializer"""
    from_participant = SessionParticipantSerializer(read_only=True)
    to_participant = SessionParticipantSerializer(read_only=True)
    
    class Meta:
        model = WebRTCSignal
        fields = [
            'id', 'signal_type', 'signal_data', 'from_participant',
            'to_participant', 'is_processed', 'created_at'
        ]
        read_only_fields = ['id', 'is_processed', 'created_at']


class SessionRecordingSerializer(serializers.ModelSerializer):
    """Session recording serializer"""
    session = LiveSessionSerializer(read_only=True)
    
    class Meta:
        model = SessionRecording
        fields = [
            'id', 'session', 'video_file', 'audio_file', 'video_url',
            'audio_url', 'duration_seconds', 'file_size_bytes', 'format',
            'quality', 'is_processing', 'is_ready', 'processing_started_at',
            'processing_completed_at', 'is_public', 'created_at'
        ]
        read_only_fields = [
            'id', 'duration_seconds', 'file_size_bytes', 'is_processing',
            'is_ready', 'processing_started_at', 'processing_completed_at',
            'created_at'
        ]


class SessionChatSerializer(serializers.ModelSerializer):
    """Session chat serializer"""
    participant = SessionParticipantSerializer(read_only=True)
    user_name = serializers.CharField(source='participant.user.get_full_name', read_only=True)
    
    class Meta:
        model = SessionChat
        fields = [
            'id', 'participant', 'user_name', 'message', 'is_private',
            'is_deleted', 'created_at'
        ]
        read_only_fields = ['id', 'participant', 'user_name', 'created_at']


class SessionResourceSerializer(serializers.ModelSerializer):
    """Session resource serializer"""
    uploaded_by = UserListSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionResource
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'file_type',
            'file_size', 'uploaded_by', 'is_downloadable', 'shared_at'
        ]
        read_only_fields = ['id', 'file_type', 'file_size', 'uploaded_by', 'shared_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class SessionStatsSerializer(serializers.Serializer):
    """Session statistics serializer"""
    total_sessions = serializers.IntegerField()
    live_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    scheduled_sessions = serializers.IntegerField()
    total_participants = serializers.IntegerField()
    average_duration = serializers.IntegerField()
    total_recordings = serializers.IntegerField()
