from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.courses.models import Course, Lesson, Category
from .models import SearchIndex

User = get_user_model()


@receiver(post_save, sender=Course)
def update_course_search_index(sender, instance, created, **kwargs):
    """Update search index when a course is created or updated"""
    if instance.status == 'published':
        SearchIndex.index_course(instance)
    else:
        # Remove from index if unpublished
        SearchIndex.remove_from_index('course', instance.id)


@receiver(post_delete, sender=Course)
def remove_course_from_search_index(sender, instance, **kwargs):
    """Remove course from search index when deleted"""
    SearchIndex.remove_from_index('course', instance.id)


@receiver(post_save, sender=Lesson)
def update_lesson_search_index(sender, instance, created, **kwargs):
    """Update search index when a lesson is created or updated"""
    if instance.is_published and instance.section.course.status == 'published':
        SearchIndex.index_lesson(instance)
    else:
        # Remove from index if unpublished
        SearchIndex.remove_from_index('lesson', instance.id)


@receiver(post_delete, sender=Lesson)
def remove_lesson_from_search_index(sender, instance, **kwargs):
    """Remove lesson from search index when deleted"""
    SearchIndex.remove_from_index('lesson', instance.id)


@receiver(post_save, sender=User)
def update_user_search_index(sender, instance, created, **kwargs):
    """Update search index when a user is created or updated"""
    if instance.is_active:
        SearchIndex.index_user(instance)
    else:
        # Remove from index if inactive
        SearchIndex.remove_from_index('user', instance.id)


@receiver(post_delete, sender=User)
def remove_user_from_search_index(sender, instance, **kwargs):
    """Remove user from search index when deleted"""
    SearchIndex.remove_from_index('user', instance.id)
