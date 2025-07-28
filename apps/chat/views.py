from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

# Placeholder views - to be implemented
class ChatRoomListView(generics.ListAPIView):
    def get(self, request):
        return Response({"message": "Chat room list - not implemented yet"})

class ChatRoomDetailView(generics.RetrieveAPIView):
    def get(self, request, pk):
        return Response({"message": f"Chat room detail for {pk} - not implemented yet"})

class JoinRoomView(generics.CreateAPIView):
    def post(self, request, pk):
        return Response({"message": f"Join room {pk} - not implemented yet"})

class LeaveRoomView(generics.CreateAPIView):
    def post(self, request, pk):
        return Response({"message": f"Leave room {pk} - not implemented yet"})

class MessageListView(generics.ListAPIView):
    def get(self, request, room_id):
        return Response({"message": f"Messages for room {room_id} - not implemented yet"})

class MarkMessageReadView(generics.UpdateAPIView):
    def put(self, request, pk):
        return Response({"message": f"Mark message {pk} as read - not implemented yet"})

class DirectMessageView(generics.ListCreateAPIView):
    def get(self, request, user_id):
        return Response({"message": f"Direct messages with user {user_id} - not implemented yet"})

class CourseChatRoomView(generics.RetrieveAPIView):
    def get(self, request, course_id):
        return Response({"message": f"Course chat for {course_id} - not implemented yet"})

class UserPresenceView(generics.ListAPIView):
    def get(self, request):
        return Response({"message": "User presence - not implemented yet"})
