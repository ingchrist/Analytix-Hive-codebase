"""
ASGI config for bmad_lms project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bmad_lms.settings.development')

# Import routing after Django setup
django_asgi_app = get_asgi_application()

from apps.chat import routing as chat_routing
from apps.notifications import routing as notifications_routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chat_routing.websocket_urlpatterns +
                notifications_routing.websocket_urlpatterns
            )
        )
    ),
})

