from rest_framework import generics, permissions
from .models import CourseAnalytics, UserProgress
from .serializers import CourseAnalyticsSerializer, UserProgressSerializer
from django.shortcuts import get_object_or_404

class CourseAnalyticsView(generics.RetrieveAPIView):
    """Retrieve course analytics"""
    serializer_class = CourseAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_object(self):
        course_id = self.kwargs['course_id']
        return get_object_or_404(CourseAnalytics, course__id=course_id)


class UserProgressListView(generics.ListAPIView):
    """List user's progress in enrolled courses"""
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related('lesson', 'enrollment')

