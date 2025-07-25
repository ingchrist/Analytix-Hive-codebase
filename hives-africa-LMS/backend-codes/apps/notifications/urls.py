from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('mark/', views.MarkNotificationsView.as_view(), name='mark-notifications'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    
    # Preferences
    path('preferences/', views.NotificationPreferenceView.as_view(), name='preferences'),
    path('type-preferences/', views.NotificationTypePreferenceView.as_view(), name='type-preferences'),
    
    # Push devices
    path('devices/', views.PushDeviceView.as_view(), name='push-devices'),
    
    # Admin
    path('send-bulk/', views.SendBulkNotificationView.as_view(), name='send-bulk'),
    
    # Test
    path('test/', views.test_notification, name='test-notification'),
]

