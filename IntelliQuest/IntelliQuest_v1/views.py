from django.shortcuts import render
from django.http import JsonResponse
from .models import Paper, PaperDetail , Author
import requests 
import time
from django_ratelimit.decorators import ratelimit
import uuid
from requests.exceptions import RequestException
from django.db import transaction

from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework import status

from django.contrib.auth import get_user_model
from rest_framework.response import Response

from django.contrib.auth import authenticate, login

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



# Login page
@api_view(['POST'])
def sign_in(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if user is not None:
        login(request, user)
        return Response({"message": "Sign in successful"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    
# Sign up page
@api_view(['POST'])
def sign_up(request):
    User = get_user_model()
    email = request.data.get('email')
    password = request.data.get('password')
    if not User.objects.filter(username=email).exists():
        user = User.objects.create_user(username=email, email=email, password=password)
        # If you have additional fields, set them here before calling save()
        user.save()
        return Response({"message": "Sign up successful"}, status=status.HTTP_201_CREATED)
    else:
        return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    
"""     
@api_view(['GET'])
def get_author_data(request):
     """