from django.shortcuts import render
from rest_framework import viewsets
from .models import PersonalInfo, Education
from .serializers import PersonalInfoSerializer, EducationSerializer
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from rest_framework.views import APIView


@api_view(['POST'])  # Using POST is more common for file uploads
@parser_classes([MultiPartParser, FormParser])  # Ensure these parsers are used to handle multipart form data
def upload_profile_picture(request, username):
    try:
        user = User.objects.get(username=username)
        personal_info = PersonalInfo.objects.get(user=user)
        # Assuming 'profile_picture' is the field name in your FormData
        file = request.FILES['profile_picture']
        personal_info.profile_picture.save(file.name, file, save=True)
        return Response({'message': 'Profile picture updated successfully.'}, status=status.HTTP_200_OK)
    except PersonalInfo.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)





class PersonalInfoView(APIView):
    """
    Retrieve or update a PersonalInfo instance based on the username.
    """

    def get(self, request, username=None):
        username = request.query_params.get('username')
        if username:
            # Fetching personal info for a specific user by username
            user = get_object_or_404(User, username=username)
            personal_info = get_object_or_404(PersonalInfo, user=user)
            serializer = PersonalInfoSerializer(personal_info)
        else:
            # Fetching all personal info instances if no username is specified
            personal_info = PersonalInfo.objects.all()
            serializer = PersonalInfoSerializer(personal_info, many=True)
        
        return Response(serializer.data)
    def patch(self, request, username):
        user = get_object_or_404(User, username=username)
        personal_info = get_object_or_404(PersonalInfo, user=user)

        serializer = PersonalInfoSerializer(personal_info, data=request.data, partial=True)
        print(serializer.is_valid())
        print(serializer.errors)
        if serializer.is_valid():
            serializer.save(user=user)  # Assuming your serializer's save method can handle user
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    # def put(self, request, username, format=None):
    #     user = get_object_or_404(User, username=username)
    #     personal_info = get_object_or_404(PersonalInfo, user=user, partial = True)
    #     serializer = PersonalInfoSerializer(data=request.data)
    #     print(serializer.is_valid())
    #     print(serializer.errors)

    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned educations to a given user,
        by filtering against a `user` query parameter in the URL.
        """
        queryset = Education.objects.all()
        user_id = self.request.query_params.get('user_id')
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        return queryset
