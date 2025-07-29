from django.db import models
from django.contrib.auth import get_user_model
from apps.courses.models import Course, Lesson, Enrollment
from django.utils import timezone

User = get_user_model()


class CourseAnalytics(models.Model):
    """Track overall course analytics"""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='analytics')
    enrollments = models.PositiveIntegerField(default=0)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Engagement
    average_time_spent = models.DurationField(default=timezone.timedelta)
    total_lessons_completed = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Course Analytics'
        verbose_name_plural = 'Course Analytics'
    
    def __str__(self):
        return f"Analytics for {self.course.title}"

    
class UserProgress(models.Model):
    """Track user lesson progress"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    time_spent = models.DurationField(default=timezone.timedelta)
    completion_timestamp = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['enrollment', 'lesson']
        verbose_name = 'User Progress'
        verbose_name_plural = 'User Progress'
    
    def __str__(self):
        return f"{self.enrollment.student.username}'s progress on {self.lesson.title}"
    
    def complete_lesson(self):
        self.is_completed = True
        self.completion_timestamp = timezone.now()
        self.save(update_fields=['is_completed', 'completion_timestamp'])

