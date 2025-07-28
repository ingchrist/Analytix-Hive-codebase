from rest_framework import serializers
from .models import User, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'address', 'city', 'country', 'timezone', 'language',
            'linkedin_url', 'twitter_url', 'website_url'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'phone_number', 'bio', 'profile_picture',
            'date_of_birth', 'is_active', 'is_verified',
            'email_notifications', 'sms_notifications', 'profile'
        ]
        read_only_fields = ['id', 'is_verified']
    
    def update(self, instance, validated_data):
        """
        Update user instance
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

