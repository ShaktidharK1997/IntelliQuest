from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Education, Experience, Publications, PersonalProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, allow_blank=False, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
            'email': {'required': True, 'allow_blank': False}
        }

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

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
        fields = ['user', 'first_name', 'last_name', 'date_of_birth', 'contact', 'location', 'profile_picture']
        extra_kwargs = {
            'user': {'read_only': True}
        }

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {
            'personal_info': {'read_only': True}
        }

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        extra_kwargs = {
            'personal_info': {'read_only': True}
        }

    def validate(self, data):
        if data['end_date'] and data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after the start date.")
        return data

class PublicationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publications
        fields = '__all__'
        extra_kwargs = {
            'personal_info': {'read_only': True}
        }
