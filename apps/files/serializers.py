from rest_framework import serializers
from django.utils.timesince import timesince
from django.conf import settings
from .models import File


class FileSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploader.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = [
            'id', 'uploader', 'uploader_name', 'file', 'name',
            'description', 'file_type', 'file_size', 'is_private',
            'allowed_users', 'expiration_date', 'time_ago', 'url',
            'created_at'
        ]
        read_only_fields = [
            'id', 'uploader', 'uploader_name', 'file_type',
            'file_size', 'time_ago', 'url', 'created_at'
        ]
    
    def get_time_ago(self, obj):
        return timesince(obj.created_at)
    
    def get_url(self, obj):
        if obj.is_private:
            return settings.SITE_URL + '/files/download/' + str(obj.id) + '/'
        return obj.file.url


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file', 'name', 'description', 'is_private', 'allowed_users']

