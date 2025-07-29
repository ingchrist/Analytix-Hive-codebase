from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.courses.models import Enrollment, Lesson, Course
from apps.analytics.models import CourseAnalytics, UserProgress
from django.utils import timezone


@receiver(post_save, sender=Enrollment)
def update_course_enrollment(sender, instance, created, **kwargs):
    """Update course analytics when enrollment is created or deleted"""
    if created:
        analytics, created = CourseAnalytics.objects.get_or_create(course=instance.course)
        analytics.enrollments = Enrollment.objects.filter(course=instance.course).count()
        analytics.save()


@receiver(post_save, sender=UserProgress)
def update_user_progress(sender, instance, created, **kwargs):
    """Update course completion rate and lesson progress"""
    if instance.is_completed:
        enrollment = instance.enrollment
        course = enrollment.course
        analytics = CourseAnalytics.objects.get(course=course)
        
        # Update course completion rate
        total_lessons = Lesson.objects.filter(section__course=course).count()
        completed_lessons = UserProgress.objects.filter(enrollment=enrollment, is_completed=True).count()
        completion_rate = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        
        analytics.completion_rate = (analytics.completion_rate + completion_rate) / 2
        analytics.total_lessons_completed += 1
        analytics.save()

