from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from apps.live_classes.models import (
    LiveSession, SessionParticipant, WebRTCSignal,
    SessionRecording, SessionChat, SessionResource
)
from apps.live_classes.serializers import (
    LiveSessionSerializer,
    LiveSessionCreateUpdateSerializer,
    SessionParticipantSerializer,
    WebRTCSignalSerializer,
    SessionRecordingSerializer,
    SessionChatSerializer,
    SessionResourceSerializer,
    SessionStatsSerializer,
)
from apps.courses.models import Course, Enrollment


class LiveSessionListCreateView(generics.ListCreateAPIView):
    """List and create live sessions"""
    queryset = LiveSession.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'course', 'instructor']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_start', 'created_at']
    ordering = ['scheduled_start']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LiveSessionCreateUpdateSerializer
        return LiveSessionSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            # Public sessions only
            return LiveSession.objects.filter(
                course__status='published',
                status__in=['scheduled', 'live']
            )
        
        if user.user_type == 'admin':
            return LiveSession.objects.all()
        elif user.user_type == 'instructor':
            return LiveSession.objects.filter(instructor=user)
        else:
            # Students see sessions for courses they're enrolled in
            enrolled_courses = Enrollment.objects.filter(
                student=user, status='active'
            ).values_list('course_id', flat=True)
            
            return LiveSession.objects.filter(
                course_id__in=enrolled_courses
            )
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if user.user_type not in ['instructor', 'admin']:
            return Response(
                {'error': 'Only instructors can create live sessions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()


class LiveSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Live session detail, update, delete"""
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LiveSessionCreateUpdateSerializer
        return LiveSessionSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_update(self, serializer):
        session = self.get_object()
        user = self.request.user
        
        if session.instructor != user and user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    def perform_destroy(self, instance):
        user = self.request.user
        
        if instance.instructor != user and user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance.delete()


class SessionJoinView(APIView):
    """Join a live session"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        try:
            session = LiveSession.objects.get(id=session_id)
        except LiveSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        # Check if user can join
        if session.instructor != user:
            # Check enrollment for students
            if not Enrollment.objects.filter(
                student=user,
                course=session.course,
                status='active'
            ).exists():
                return Response(
                    {'error': 'Not enrolled in course'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check session status
        if session.status not in ['scheduled', 'live']:
            return Response(
                {'error': 'Session is not available for joining'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check participant limit
        if session.participants.filter(is_online=True).count() >= session.max_participants:
            return Response(
                {'error': 'Session is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create participant
        participant, created = SessionParticipant.objects.get_or_create(
            session=session,
            user=user,
            defaults={
                'role': 'instructor' if session.instructor == user else 'student'
            }
        )
        
        # Mark as joined
        participant.join()
        
        # Start session if instructor joins and session is scheduled
        if session.instructor == user and session.status == 'scheduled':
            session.start_session()
        
        return Response({
            'session': LiveSessionSerializer(session, context={'request': request}).data,
            'participant': SessionParticipantSerializer(participant).data,
            'room_id': session.room_id
        })


class SessionLeaveView(APIView):
    """Leave a live session"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        try:
            session = LiveSession.objects.get(id=session_id)
            participant = SessionParticipant.objects.get(
                session=session,
                user=request.user
            )
        except (LiveSession.DoesNotExist, SessionParticipant.DoesNotExist):
            return Response(
                {'error': 'Session or participation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mark as left
        participant.leave()
        
        # End session if instructor leaves
        if session.instructor == request.user and session.status == 'live':
            session.end_session()
        
        return Response({'message': 'Left session successfully'})


class SessionParticipantsView(generics.ListAPIView):
    """List session participants"""
    serializer_class = SessionParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs['session_id']
        
        # Check if user can view participants
        session = get_object_or_404(LiveSession, id=session_id)
        user = self.request.user
        
        if session.instructor == user:
            # Instructors can see all participants
            return SessionParticipant.objects.filter(session=session)
        elif Enrollment.objects.filter(
            student=user, course=session.course, status='active'
        ).exists():
            # Students can see online participants
            return SessionParticipant.objects.filter(
                session=session, is_online=True
            )
        else:
            return SessionParticipant.objects.none()


class WebRTCSignalView(APIView):
    """Handle WebRTC signaling"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        try:
            session = LiveSession.objects.get(id=session_id)
            from_participant = SessionParticipant.objects.get(
                session=session,
                user=request.user
            )
        except (LiveSession.DoesNotExist, SessionParticipant.DoesNotExist):
            return Response(
                {'error': 'Session or participation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        signal_type = request.data.get('signal_type')
        signal_data = request.data.get('signal_data')
        to_participant_id = request.data.get('to_participant_id')
        
        to_participant = None
        if to_participant_id:
            try:
                to_participant = SessionParticipant.objects.get(
                    id=to_participant_id,
                    session=session
                )
            except SessionParticipant.DoesNotExist:
                return Response(
                    {'error': 'Target participant not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Create signal
        signal = WebRTCSignal.objects.create(
            session=session,
            from_participant=from_participant,
            to_participant=to_participant,
            signal_type=signal_type,
            signal_data=signal_data
        )
        
        # Send signal via WebSocket
        channel_layer = get_channel_layer()
        
        if to_participant:
            # Send to specific participant
            group_name = f"session_{session.room_id}_user_{to_participant.user.id}"
        else:
            # Broadcast to all participants
            group_name = f"session_{session.room_id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'webrtc_signal',
                'signal': WebRTCSignalSerializer(signal).data
            }
        )
        
        return Response(WebRTCSignalSerializer(signal).data)


class SessionChatListCreateView(generics.ListCreateAPIView):
    """Session chat messages"""
    serializer_class = SessionChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs['session_id']
        
        # Check if user can access chat
        session = get_object_or_404(LiveSession, id=session_id)
        user = self.request.user
        
        if session.instructor == user or Enrollment.objects.filter(
            student=user, course=session.course, status='active'
        ).exists():
            return SessionChat.objects.filter(
                session=session, is_deleted=False
            ).order_by('created_at')
        
        return SessionChat.objects.none()
    
    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        session = get_object_or_404(LiveSession, id=session_id)
        
        try:
            participant = SessionParticipant.objects.get(
                session=session,
                user=self.request.user
            )
        except SessionParticipant.DoesNotExist:
            return Response(
                {'error': 'Not a participant in this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not participant.can_chat:
            return Response(
                {'error': 'Chat permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message = serializer.save(
            session=session,
            participant=participant
        )
        
        # Send message via WebSocket
        channel_layer = get_channel_layer()
        group_name = f"session_{session.room_id}_chat"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'chat_message',
                'message': SessionChatSerializer(message).data
            }
        )


class SessionResourceListCreateView(generics.ListCreateAPIView):
    """Session resources"""
    serializer_class = SessionResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs['session_id']
        session = get_object_or_404(LiveSession, id=session_id)
        
        # Check access
        user = self.request.user
        if session.instructor == user or Enrollment.objects.filter(
            student=user, course=session.course, status='active'
        ).exists():
            return SessionResource.objects.filter(session=session)
        
        return SessionResource.objects.none()
    
    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        session = get_object_or_404(LiveSession, id=session_id)
        
        # Only instructor can upload resources
        if session.instructor != self.request.user:
            return Response(
                {'error': 'Only instructors can upload resources'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(
            session=session,
            uploaded_by=self.request.user
        )


class SessionRecordingListView(generics.ListAPIView):
    """List session recordings"""
    serializer_class = SessionRecordingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_ready', 'is_public']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'admin':
            return SessionRecording.objects.all()
        elif user.user_type == 'instructor':
            return SessionRecording.objects.filter(
                session__instructor=user
            )
        else:
            # Students can see recordings of sessions they participated in
            participated_sessions = SessionParticipant.objects.filter(
                user=user
            ).values_list('session_id', flat=True)
            
            return SessionRecording.objects.filter(
                session_id__in=participated_sessions,
                is_ready=True
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def session_statistics(request):
    """Get session statistics"""
    user = request.user
    
    if user.user_type == 'admin':
        # Admin sees all statistics
        queryset = LiveSession.objects.all()
    elif user.user_type == 'instructor':
        # Instructor sees their statistics
        queryset = LiveSession.objects.filter(instructor=user)
    else:
        # Students see statistics for sessions they participated in
        participated_sessions = SessionParticipant.objects.filter(
            user=user
        ).values_list('session_id', flat=True)
        queryset = LiveSession.objects.filter(id__in=participated_sessions)
    
    stats = {
        'total_sessions': queryset.count(),
        'live_sessions': queryset.filter(status='live').count(),
        'completed_sessions': queryset.filter(status='ended').count(),
        'scheduled_sessions': queryset.filter(status='scheduled').count(),
        'total_participants': SessionParticipant.objects.filter(
            session__in=queryset
        ).count(),
        'average_duration': queryset.filter(
            actual_start__isnull=False,
            actual_end__isnull=False
        ).aggregate(
            avg_duration=Avg('duration_minutes')
        )['avg_duration'] or 0,
        'total_recordings': SessionRecording.objects.filter(
            session__in=queryset
        ).count(),
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_session(request, session_id):
    """Start a live session"""
    try:
        session = LiveSession.objects.get(id=session_id)
    except LiveSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Only instructor can start session
    if session.instructor != request.user:
        return Response(
            {'error': 'Only instructor can start session'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if session.status != 'scheduled':
        return Response(
            {'error': 'Session cannot be started'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    session.start_session()
    
    return Response({
        'message': 'Session started successfully',
        'session': LiveSessionSerializer(session, context={'request': request}).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_session(request, session_id):
    """End a live session"""
    try:
        session = LiveSession.objects.get(id=session_id)
    except LiveSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Only instructor can end session
    if session.instructor != request.user:
        return Response(
            {'error': 'Only instructor can end session'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if session.status != 'live':
        return Response(
            {'error': 'Session is not live'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    session.end_session()
    
    # Mark all participants as offline
    SessionParticipant.objects.filter(
        session=session, is_online=True
    ).update(is_online=False, left_at=timezone.now())
    
    return Response({
        'message': 'Session ended successfully',
        'session': LiveSessionSerializer(session, context={'request': request}).data
    })
