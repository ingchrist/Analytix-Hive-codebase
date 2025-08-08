from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from apps.core.models import TimeStampedModel, UUIDModel
import os

User = get_user_model()


def user_directory_path(instance, filename):
    """Generate file path for new uploads"""
    return os.path.join(
        'uploads', f'user_{instance.uploader.id}', filename
    )


class File(UUIDModel, TimeStampedModel):
    """Model to save file uploads"""
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploads')
    file = models.FileField(upload_to=user_directory_path, max_length=500)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # File metadata
    file_type = models.CharField(max_length=10, blank=True)
    file_size = models.PositiveIntegerField(blank=True, null=True)
    
    # Privacy
    is_private = models.BooleanField(default=False)
    allowed_users = models.ManyToManyField(User, related_name='allowed_files', blank=True)
    expiration_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def delete(self, *args, **kwargs):
        """Delete file from storage when record is deleted"""
        self.file.delete(save=False)
        super().delete(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        if not self.file_type:
            self.file_type = self.file.name.split('.')[-1].lower()
        if not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

