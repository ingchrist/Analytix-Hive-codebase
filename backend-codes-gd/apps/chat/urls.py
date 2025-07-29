from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Room management
    path('rooms/', views.ChatRoomListView.as_view(), name='room-list'),
    path('rooms/<uuid:pk>/', views.ChatRoomDetailView.as_view(), name='room-detail'),
    path('rooms/<uuid:pk>/join/', views.JoinRoomView.as_view(), name='join-room'),
    path('rooms/<uuid:pk>/leave/', views.LeaveRoomView.as_view(), name='leave-room'),
    
    # Messages
    path('rooms/<uuid:room_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('messages/<uuid:pk>/read/', views.MarkMessageReadView.as_view(), name='mark-read'),
    
    # Direct messages
    path('direct/<int:user_id>/', views.DirectMessageView.as_view(), name='direct-message'),
    
    # Course chat
    path('course/<uuid:course_id>/', views.CourseChatRoomView.as_view(), name='course-chat'),
    
    # User presence
    path('presence/', views.UserPresenceView.as_view(), name='user-presence'),
]

