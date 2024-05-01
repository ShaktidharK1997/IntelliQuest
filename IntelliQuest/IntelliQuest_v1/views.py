# Standard library imports
import base64
import logging
import time
import uuid
from datetime import date

# Third-party imports
import requests
from requests.exceptions import RequestException

# Django imports
from django.contrib.auth import authenticate, get_user_model, login
from django.core.files.base import ContentFile
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django_ratelimit.decorators import ratelimit

# Django REST Framework imports
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Local imports
from .authentication import EmailBackend, get_tokens_for_user
from .models import CustomUser, Education, Experience, Paper, PaperDetail, PersonalProfile, Publications, Author, Bookmarked
from .serializers import EducationSerializer, ExperienceSerializer, ProfileSerializer, PublicationsSerializer, UserSerializer, BookmarkedSerializer

# Logger configuration
logger = logging.getLogger(__name__)

class CreateUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.debug("Received request data: %s", request.data)
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()
                    tokens = get_tokens_for_user(user)
                    logger.debug("User created with tokens: %s", tokens)

                    # Create a PersonalProfile instance when a user is created
                    PersonalProfile.objects.create(
                        user=user,
                        first_name=request.data.get('first_name', 'Not provided'),
                        last_name=request.data.get('last_name', 'Not provided'),
                        date_of_birth=request.data.get('date_of_birth', date.today()),  # Use current date as default
                        contact=request.data.get('contact', '0000000000'),
                        location=request.data.get('location', 'Unknown')
                    )

                    return Response({
                        'access': tokens['access'],
                        'refresh': tokens['refresh'],
                        'user_id': user.pk,
                        'email': user.email,
                        'msg': 'User Created Successfully'
                    }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error("Error creating user or profile: %s", e)
                return Response({
                    "errors": "Error creating user or profile",
                    "msg": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            logger.error("Errors: %s", serializer.errors)
            return Response({
                "errors": serializer.errors,
                "msg": "Error Creating User, check data provided"
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.debug(f"Attempting to authenticate user {email}")
        
        auth_backend = EmailBackend()
        user = auth_backend.authenticate(request, username=email, password=password)
        
        if user:
            logger.info(f"User {email} authenticated successfully")
            tokens = get_tokens_for_user(user)
            
            try:
                profile = PersonalProfile.objects.get(user=user)
                profile_data = ProfileSerializer(profile).data
                education_data = EducationSerializer(profile.education.all(), many=True).data
                experience_data = ExperienceSerializer(profile.experience.all(), many=True).data
                publications_data = PublicationsSerializer(profile.publications.all(), many=True).data
                logger.debug("Successfully retrieved all user profile related data.")
            except PersonalProfile.DoesNotExist:
                logger.error(f"Profile for user {email} not found.")
                return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'email': email,
                'profile': profile_data,
                'education': education_data,
                'experience': experience_data,
                'publications': publications_data
            }, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Authentication failed for user {email}")
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]  # Use JSONParser for regular PATCH requests

    def get(self, request, email):
        print("Request headers : ",request.headers)

        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, email):
        logger.debug(f"Received headers: {request.headers}")

        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfilePictureView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request, email):
        logger.debug(f"Updating profile picture for email: {email}")
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        
        profile_picture = request.FILES.get('profile_picture')
        if profile_picture:
            profile.profile_picture.save(profile_picture.name, profile_picture, save=True)
            logger.info(f"Profile picture updated for email: {email}")
            return Response({'message': 'Profile picture updated successfully.'})
        else:
            logger.error("No profile picture provided for update.")
            return Response({'error': 'No profile picture provided.'}, status=status.HTTP_400_BAD_REQUEST)

class EducationView(APIView):
    # Use the appropriate permission class
    # For example, IsAuthenticated to ensure only authenticated users can access the view
    permission_classes = [AllowAny]


    def get(self, request, email):

        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)

        educations = Education.objects.filter(personal_info_id = profile.id)
        serializer = EducationSerializer(educations, many=True)
        return Response(serializer.data)

    def post(self, request, email):
        # logger.debug(f"Request data: {request.data}")
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        request.data['personal_info'] = profile.id

        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.debug("Education record created successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Failed to create education record: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, email, edu_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        request.data['personal_info'] = profile.id
        education = get_object_or_404(Education, id=edu_id, personal_info_id=profile.id)

        serializer = EducationSerializer(education, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.debug("Education record updated successfully.")
            return Response(serializer.data)
        else:
            logger.error(f"Failed to update education record: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, email, edu_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)

        education = get_object_or_404(Education,id =edu_id, personal_info_id=profile.id)

        education.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExperienceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, email):

        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)

        experiences = Experience.objects.filter(personal_info_id = profile.id)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response(serializer.data)

    def post(self, request, email):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        request.data['personal_info'] = profile.id

        logger.debug(f"Request data : {request.data}")

        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.debug("Experience record created successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Failed to create experience record: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
    def put(self, request, email, exp_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        request.data['personal_info'] = profile.id
        experience = get_object_or_404(Experience, id=exp_id, personal_info_id=profile.id)

        serializer = ExperienceSerializer(experience, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.debug("Experience record updated successfully.")
            return Response(serializer.data)
        else:
            logger.error(f"Failed to update experience record: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, email, exp_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)

        experience = get_object_or_404(Experience,id =exp_id, personal_info_id=profile.id)
        logger.debug(f"Data to delete : {experience}")
        experience.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicationsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, email):
        logger.debug(f"Fetching publication records for user with email: {email}")
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        publications = Publications.objects.filter(personal_info_id=profile.id)
        serializer = PublicationsSerializer(publications, many=True)
        return Response(serializer.data)

    def post(self, request, email):
        logger.debug(f"Creating new publication record for user with email: {email}")
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        
        # Since the client doesn't handle profile IDs, automatically attach the profile ID to the data
        request.data['personal_info'] = profile.id
        serializer = PublicationsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Publication record created for user with email: {email}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, email, pub_id):
        logger.debug(f"Updating publication record for user with email: {email}")
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        publication = get_object_or_404(Publications, id=pub_id, personal_info_id=profile.id)
        request.data['personal_info'] = profile.id
        serializer = PublicationsSerializer(publication, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            logger.error(f"Failed to update publication record: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, email, pub_id):
        logger.debug(f"Deleting publication record for user with email: {email}")
        user = get_object_or_404(CustomUser, email=email)
        publication = get_object_or_404(Publications, id=pub_id, personal_profile__user=user)
        
        publication.delete()
        logger.info(f"Publication record deleted for user with email: {email}")
        return Response(status=status.HTTP_204_NO_CONTENT)
    

SEMANTIC_SCHOLAR_API_KEY = '8kxH5DVIYTaE4X2naV3l83RYdf0bYxg7DSFdd7U3'

CORE_API_KEY = '4yDRVsbu3MaJxAfQnWUjXtkHT2NehlKE'

# Create your views here.

#Exponential backoff ratelimiting 

def rate_limiting_with_exponential_backoff(url, params, headers = None,max_retries = 5, initial_wait = 1, backoff_factor = 2):
    retries = 0
    wait_time = initial_wait

    while retries < max_retries:
        try:
            response = requests.get(url, params=params, headers= headers)
            if response.status_code == 200:
                return response  # Return the response if successful
            elif response.status_code == 429 or 500 <= response.status_code < 600:
                # Check if the retry limit has been exceeded
                if retries == max_retries - 1:
                    raise Exception("Maximum retries reached, giving up.")
                # Wait before retrying
                time.sleep(wait_time)
                # Increase the wait time for the next retry
                wait_time *= backoff_factor
                retries += 1
            else:
                response.raise_for_status()
        except requests.exceptions.RequestException as e:
            if retries == max_retries - 1:
                raise Exception(f"API request failed after {max_retries} retries.") from e
            # Wait and retry for other exceptions like timeouts or connection errors
            time.sleep(wait_time)
            wait_time *= backoff_factor
            retries += 1

#Search in CORE API
def make_CORE_request(endpoint, query_params = {}):
    url = f'https://api.core.ac.uk/v3/{endpoint}'

    query_params['api-key'] = CORE_API_KEY

    try:
        response = rate_limiting_with_exponential_backoff(url,params = query_params)
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        print(e)
        return None

    
#Search in Semantic Scholar API 
def make_semantic_scholar_request(endpoint, query_params= None):
    url = f'https://api.semanticscholar.org/graph/v1/{endpoint}'
    headers = {'x-api-key': SEMANTIC_SCHOLAR_API_KEY}
    try:
        #response = requests.get(url, params=query_params, headers=headers, timeout=2)
        response = rate_limiting_with_exponential_backoff(url, params=query_params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout as e:
        print("The request timed out:", e)
        return None
    except RequestException as e:
        print(e)
        return None

def get_paper_info(request):
    
    query = request.GET.get('paperid')
    source = request.GET.get('source')
    results =  get_paper_details(query, source)

    return JsonResponse(results, safe=False)
    
def get_paper_details(paper_id, source):
    paper_details = {}

    if source == '1':  # Semantic Scholar
        query_params = {
            'fields': 'paperId,title,publicationVenue,year,authors,abstract,citationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,journal,publicationDate'
        }
        result = make_semantic_scholar_request(f'paper/{paper_id}', query_params=query_params)
        print(result)
        if result:
            publication_venue = ""
            download_link = ""
            journal_name = ""
            pub_venue = result.get('publicationVenue', {})
            if pub_venue:
                publication_venue = pub_venue.get('name')

            oap = result.get('openAccessPdf', {})

            if oap:
                download_link = oap.get('url')

            ijournal = result.get('journal', {})
            if ijournal:
                journal_name = ijournal.get('name')



            paper_details = {
                'title': result.get('title', 'No title available'),
                'paperID': result.get('paperId'),
                'year': result.get('year', 'Year not available'),
                'abstract': result.get('abstract', 'Abstract not available'),
                'citationCount': result.get('citationCount', 0),
                'isOpenAccess': result.get('isOpenAccess', False),
                'downloadLink': download_link,
                'authors': result.get('authors', []),
                'publicationVenue': publication_venue,
                'fieldsOfStudy': result.get('fieldsOfStudy', []),
                'journalName': journal_name,
                'publicationDate': result.get('publicationDate', 'No publication date available')
            }
    elif source == '2':  # CORE
        result = make_CORE_request(f'outputs/{paper_id}')
        if result:
            paper_details = {
                'title': result.get('title', 'No title available'),
                'paperID': result.get('id'),
                'year': result.get('yearPublished', 'Year not available'),
                'abstract': result.get('abstract', 'Abstract not available'),
                'citationCount': result.get('citationCount', 0),
                'downloadLink': result.get('downloadUrl', ''),
                'authors': result.get('authors', []),
                'dataProvider': result.get('dataProvider', {}).get('name', 'No data provider available'),
                'publicationDate': result.get('publishedDate', 'No publication date available')
            }

    return paper_details



def get_bulk_paper_details(paper_ids):
    endpoint = 'https://api.semanticscholar.org/graph/v1/paper/batch'
    headers = {'x-api-key': SEMANTIC_SCHOLAR_API_KEY}
    params = {'fields': 'paperId,title,publicationVenue,year,authors,abstract,citationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,journal,publicationDate'}
    data = {"ids": paper_ids}

    try:
        response = requests.post(endpoint, params=params, json=data, headers=headers, timeout=2)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout as e:
        print("The request timed out:", e)
        return None
    except RequestException as e:
        print(e)
        return None
    

def search_articles(request):
    query = request.GET.get('query', '')

    # Prepare to fetch results from Semantic Scholar
    query_params = {'query': query, 'limit': 20}
    api_results_semanticsearch = make_semantic_scholar_request('paper/search', query_params=query_params)

    results = []

    if api_results_semanticsearch and 'data' in api_results_semanticsearch:
        paper_ids_for_batch = [paper['paperId'] for paper in api_results_semanticsearch['data']]
        batch_paper_details = get_bulk_paper_details(paper_ids_for_batch)
        if batch_paper_details:
            for paper_details in batch_paper_details:
                link = ""
                publication_venue_name = ""

                # Check if paper_details is not None
                # Now it's safe to use .get() since paper_details is confirmed to be a dictionary
                if paper_details.get('isOpenAccess'):

                    oapdf = paper_details['openAccessPdf']
                    if oapdf is not None:
                        link=oapdf['url']
                
                pub_venue = paper_details.get('publicationVenue')
                if pub_venue is not None:
                    publication_venue_name = pub_venue.get('name',"")

                paper_info = {
                    'title': paper_details.get('title', 'No title available'),
                    'paperID': paper_details.get('paperId', 'No ID available'),
                    'year': paper_details.get('year', 'Year not available'),
                    'abstract': paper_details.get('abstract', 'Abstract not available'),
                    'authors': paper_details.get('authors', []),
                    'downloadlink': link,
                    'venue' : publication_venue_name,
                    'source' : 1,
                    'citationCount': paper_details.get('citationCount', 0)
                }
                results.append(paper_info)

    # Prepare to fetch results from CORE API
    query_params = {'page': 1, 'pageSize': 4, 'q': query}
    api_results_coresearch = make_CORE_request('search/works', query_params=query_params)

    if api_results_coresearch and 'results' in api_results_coresearch:
        for paper in api_results_coresearch['results']:
            paper_info = {
                'title': paper.get('title', 'No title available'),
                'paperID': paper.get('id', 'No ID available'),
                'year': paper.get('yearPublished', 'Year not available'),
                'abstract': paper.get('abstract', 'Abstract not available'),
                'authors': paper.get('authors', []),
                'downloadlink': paper.get('downloadUrl', ''),
                'source' : 2,
                'citationCount': paper.get('citationCount', 0)
            }
            results.append(paper_info)

    return JsonResponse({'results': results})


class BookmarkedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, email):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        bookmarks = Bookmarked.objects.filter(personal_info=profile)
        serializer = BookmarkedSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request, email):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        data = request.data.copy()
        data['personal_info'] = profile.pk
        serializer = BookmarkedSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, email, paper_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        bookmark = get_object_or_404(Bookmarked, paperID=paper_id, personal_info=profile)
        serializer = BookmarkedSerializer(bookmark, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, email, paper_id):
        user = get_object_or_404(CustomUser, email=email)
        profile = get_object_or_404(PersonalProfile, user=user)
        bookmark = get_object_or_404(Bookmarked, paperID=paper_id, personal_info=profile)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)