# apps/chat/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Chat room WebSocket
    path('ws/chat/<uuid:room_id>/', consumers.ChatConsumer.as_asgi()),
    
    # Private chat WebSocket
    path('ws/private-chat/<uuid:user_id>/', consumers.PrivateChatConsumer.as_asgi()),
]


