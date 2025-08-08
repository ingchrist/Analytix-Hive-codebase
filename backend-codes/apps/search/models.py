from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.contrib.postgres.indexes import GinIndex
from apps.core.models import TimeStampedModel, UUIDModel
from apps.courses.models import Course, Lesson, Category

User = get_user_model()


class SearchHistory(UUIDModel, TimeStampedModel):
    """Track user search history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history', null=True, blank=True)
    query = models.CharField(max_length=255, db_index=True)
    results_count = models.PositiveIntegerField(default=0)
    
    # Optional: Track what type of search was performed
    SEARCH_TYPES = [
        ('all', 'All'),
        ('courses', 'Courses'),
        ('users', 'Users'),
        ('lessons', 'Lessons'),
    ]
    search_type = models.CharField(max_length=20, choices=SEARCH_TYPES, default='all')
    
    # Track user's IP for anonymous searches
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Search History'
        verbose_name_plural = 'Search Histories'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['query']),
        ]
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.query}"


class PopularSearch(models.Model):
    """Track popular search terms"""
    query = models.CharField(max_length=255, unique=True, db_index=True)
    search_count = models.PositiveIntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-search_count', '-last_searched']
        verbose_name = 'Popular Search'
        verbose_name_plural = 'Popular Searches'
    
    def __str__(self):
        return f"{self.query} ({self.search_count} searches)"
    
    @classmethod
    def increment_or_create(cls, query):
        """Increment search count or create new entry"""
        popular, created = cls.objects.get_or_create(
            query=query.lower().strip()
        )
        if not created:
            popular.search_count += 1
            popular.save(update_fields=['search_count', 'last_searched'])
        return popular


class SearchIndex(models.Model):
    """
    Unified search index for better performance
    Uses PostgreSQL full-text search capabilities
    """
    CONTENT_TYPES = [
        ('course', 'Course'),
        ('lesson', 'Lesson'),
        ('user', 'User'),
        ('category', 'Category'),
    ]
    
    # Generic reference to the indexed object
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, db_index=True)
    object_id = models.UUIDField(db_index=True)
    
    # Searchable fields
    title = models.CharField(max_length=500)
    description = models.TextField()
    tags = models.TextField(blank=True)  # Space-separated tags
    
    # Additional metadata for filtering
    is_active = models.BooleanField(default=True)
    is_free = models.BooleanField(default=False, null=True, blank=True)  # For courses
    difficulty = models.CharField(max_length=20, blank=True)  # For courses/lessons
    instructor_name = models.CharField(max_length=255, blank=True)  # For courses
    
    # Search vector for full-text search
    search_vector = SearchVector('title', weight='A') + \
                   SearchVector('description', weight='B') + \
                   SearchVector('tags', weight='C')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            GinIndex(fields=['title', 'description']),
            models.Index(fields=['content_type', 'is_active']),
            models.Index(fields=['object_id']),
        ]
        unique_together = ['content_type', 'object_id']
    
    def __str__(self):
        return f"{self.get_content_type_display()} - {self.title}"
    
    @classmethod
    def index_course(cls, course):
        """Index or update a course in the search index"""
        cls.objects.update_or_create(
            content_type='course',
            object_id=course.id,
            defaults={
                'title': course.title,
                'description': f"{course.description} {course.short_description}",
                'tags': f"{course.category.name if course.category else ''} {course.difficulty}",
                'is_active': course.status == 'published',
                'is_free': course.is_free,
                'difficulty': course.difficulty,
                'instructor_name': course.instructor.get_full_name(),
            }
        )
    
    @classmethod
    def index_lesson(cls, lesson):
        """Index or update a lesson in the search index"""
        cls.objects.update_or_create(
            content_type='lesson',
            object_id=lesson.id,
            defaults={
                'title': lesson.title,
                'description': lesson.description,
                'tags': f"{lesson.lesson_type} {lesson.section.course.title}",
                'is_active': lesson.is_published,
                'difficulty': lesson.section.course.difficulty,
            }
        )
    
    @classmethod
    def index_user(cls, user):
        """Index or update a user in the search index"""
        cls.objects.update_or_create(
            content_type='user',
            object_id=user.id,
            defaults={
                'title': user.get_full_name() or user.email,
                'description': user.bio or '',
                'tags': user.user_type,
                'is_active': user.is_active,
            }
        )
    
    @classmethod
    def remove_from_index(cls, content_type, object_id):
        """Remove an object from the search index"""
        cls.objects.filter(content_type=content_type, object_id=object_id).delete()


class SavedSearch(UUIDModel, TimeStampedModel):
    """Allow users to save search queries for later"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=100)
    query = models.CharField(max_length=255)
    filters = models.JSONField(default=dict, blank=True)  # Store search filters
    
    # Notification settings
    notify_new_results = models.BooleanField(default=False)
    last_notified = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
