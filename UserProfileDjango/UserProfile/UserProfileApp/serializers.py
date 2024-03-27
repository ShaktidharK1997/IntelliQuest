from rest_framework import serializers
from .models import PersonalInfo, Education
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class PersonalInfoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=False, allow_blank=True, source='user.username')

    class Meta:
        model = PersonalInfo
        fields = '__all__'

    def validate_username(self, value):
        # Ensure the provided username exists
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this username does not exist.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username', None)
        if username:
            user = User.objects.get(username=username)
            validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        if username:
            user = User.objects.get(username=username)
            validated_data['user'] = user
        return super().update(instance, validated_data)
