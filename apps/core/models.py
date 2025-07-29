from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TimeStampedModel(models.Model):
    """
    Abstract base class that provides self-updating 
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class SEOModel(models.Model):
    """
    Abstract base class for SEO fields
    """
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    class Meta:
        abstract = True

