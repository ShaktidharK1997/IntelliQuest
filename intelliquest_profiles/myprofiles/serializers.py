from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Education, Experience, PublishedArticle

# User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

# UserProfile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)

    class Meta:
        model = UserProfile
        fields = ('user', 'location', 'mobile_number', 'type_of_user', 'profile_pic', 'bio', 'social_media')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        user_profile = UserProfile.objects.create(user=user, **validated_data)
        return user_profile

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        user = instance.user

        instance.location = validated_data.get('location', instance.location)
        instance.mobile_number = validated_data.get('mobile_number', instance.mobile_number)
        # instance.type_of_user = validated_data.get('type_of_user', instance.type_of_user)
        instance.profile_pic = validated_data.get('profile_pic', instance.profile_pic)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.social_media = validated_data.get('social_media', instance.social_media)
        instance.save()

        user.username = user_data.get('username', user.username)
        user.email = user_data.get('email', user.email)
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()

        return instance

# Education serializer
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

# Experience serializer
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

# PublishedArticle serializer
class PublishedArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublishedArticle
        fields = '__all__'
