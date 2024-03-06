from .models import UserProfile, Education, Experience, PublishedArticle
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile, Education, Experience, PublishedArticle
from .serializers import (UserProfileSerializer, EducationSerializer, 
                          ExperienceSerializer, PublishedArticleSerializer)

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Returns the profile of the logged-in user
        return UserProfile.objects.filter(user=self.request.user)


class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

    def perform_create(self, serializer):
        serializer.save(username=self.request.user)

class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

    def perform_create(self, serializer):
        serializer.save(username=self.request.user)

class PublishedArticleViewSet(viewsets.ModelViewSet):
    queryset = PublishedArticle.objects.all()
    serializer_class = PublishedArticleSerializer

    def perform_create(self, serializer):
        serializer.save(username=self.request.user)
