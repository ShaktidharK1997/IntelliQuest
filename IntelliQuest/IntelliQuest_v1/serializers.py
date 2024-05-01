# serializers.py

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import PersonalProfile, Education, Experience, Publications, Bookmarked

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        validators=[
            UniqueValidator(queryset=User.objects.all(), message="A user with that email already exists.")
        ]
    )

    class Meta:
        model = User
        fields = ['email', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'min_length': 8,
                'validators': [validate_password]
            },
            'email': {
                'required': True,
                'allow_blank': False
            }
        }

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=True  # Set to False if you require email verification
        )

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalProfile
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {
            'personal_profile': {'read_only': True}
        }

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        extra_kwargs = {
            'personal_profile': {'read_only': True}
        }


class PublicationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publications
        fields = '__all__'
        extra_kwargs = {
            'personal_profile': {'read_only': True}
        }

class BookmarkedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmarked
        fields = '__all__'
        extra_kwargs = {
            'personal_profile': {'read_only': True}
        }