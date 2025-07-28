from django.contrib.auth import get_user_model
from django.db.models import Q
from apps.courses.models import Course, Lesson

User = get_user_model()


def search_courses(query):
    """Search for courses based on title, description, and category."""
    return Course.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(category__name__icontains=query)
    ).distinct()


def search_users(query):
    """Search for users based on email and name."""
    return User.objects.filter(
        Q(email__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).distinct()


def search_lessons(query):
    """Search for lessons based on title and description."""
    return Lesson.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query)
    ).distinct()

