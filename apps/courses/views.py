from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

# Placeholder views - to be implemented
class CategoryListView(generics.ListAPIView):
    def get(self, request):
        return Response({"message": "Category list - not implemented yet"})

class CourseListView(generics.ListAPIView):
    def get(self, request):
        return Response({"message": "Course list - not implemented yet"})

class CourseDetailView(generics.RetrieveAPIView):
    def get(self, request, slug):
        return Response({"message": f"Course detail for {slug} - not implemented yet"})

class EnrollCourseView(generics.CreateAPIView):
    def post(self, request, slug):
        return Response({"message": f"Enroll in course {slug} - not implemented yet"})

class CourseReviewsView(generics.ListCreateAPIView):
    def get(self, request, slug):
        return Response({"message": f"Reviews for course {slug} - not implemented yet"})

class MyEnrollmentsView(generics.ListAPIView):
    def get(self, request):
        return Response({"message": "My enrollments - not implemented yet"})

@api_view(['GET'])
def course_progress(request, slug):
    return Response({"message": f"Progress for course {slug} - not implemented yet"})
