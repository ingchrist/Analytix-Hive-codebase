from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review, Enrollment, LessonProgress


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_course_rating(sender, instance, **kwargs):
    """Update course average rating when review is added/updated/deleted"""
    from django.db.models import Avg
    
    course = instance.course
    reviews = Review.objects.filter(course=course, is_published=True)
    
    avg_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    total_reviews = reviews.count()
    
    course.average_rating = avg_rating
    course.total_reviews = total_reviews
    course.save(update_fields=['average_rating', 'total_reviews'])


@receiver(post_save, sender=LessonProgress)
def update_enrollment_progress(sender, instance, **kwargs):
    """Update enrollment progress when lesson progress changes"""
    enrollment = instance.enrollment
    course = enrollment.course
    
    total_lessons = course.sections.aggregate(
        total=models.Count('lessons')
    )['total'] or 0
    
    completed_lessons = enrollment.lesson_progress.filter(
        is_completed=True
    ).count()
    
    if total_lessons > 0:
        progress_percentage = (completed_lessons / total_lessons) * 100
        enrollment.progress_percentage = progress_percentage
        
        # Mark as completed if 100%
        if progress_percentage >= 100 and enrollment.status == 'active':
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
        
        enrollment.save(update_fields=['progress_percentage', 'status', 'completed_at'])

