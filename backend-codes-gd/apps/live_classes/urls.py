from django.urls import path
from apps.live_classes.views import (
    LiveSessionListCreateView,
    LiveSessionDetailView,
    SessionJoinView,
    SessionLeaveView,
    SessionParticipantsView,
    WebRTCSignalView,
    SessionChatListCreateView,
    SessionResourceListCreateView,
    SessionRecordingListView,
    session_statistics,
    start_session,
    end_session,
)

app_name = 'live_classes'

urlpatterns = [
    # Live sessions
    path('', LiveSessionListCreateView.as_view(), name='session_list_create'),
    path('<uuid:pk>/', LiveSessionDetailView.as_view(), name='session_detail'),
    
    # Session management
    path('<uuid:session_id>/join/', SessionJoinView.as_view(), name='session_join'),
    path('<uuid:session_id>/leave/', SessionLeaveView.as_view(), name='session_leave'),
    path('<uuid:session_id>/start/', start_session, name='session_start'),
    path('<uuid:session_id>/end/', end_session, name='session_end'),
    
    # Session participants
    path('<uuid:session_id>/participants/', SessionParticipantsView.as_view(), name='session_participants'),
    
    # WebRTC signaling
    path('<uuid:session_id>/signal/', WebRTCSignalView.as_view(), name='webrtc_signal'),
    
    # Session chat
    path('<uuid:session_id>/chat/', SessionChatListCreateView.as_view(), name='session_chat'),
    
    # Session resources
    path('<uuid:session_id>/resources/', SessionResourceListCreateView.as_view(), name='session_resources'),
    
    # Recordings
    path('recordings/', SessionRecordingListView.as_view(), name='session_recordings'),
    
    # Statistics
    path('statistics/', session_statistics, name='session_statistics'),
]
