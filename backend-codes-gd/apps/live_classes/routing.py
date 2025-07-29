from django.urls import path
from apps.live_classes.consumers import LiveSessionConsumer

websocket_urlpatterns = [
    path('ws/live-sessions/<uuid:session_id>/', LiveSessionConsumer.as_asgi()),
]
