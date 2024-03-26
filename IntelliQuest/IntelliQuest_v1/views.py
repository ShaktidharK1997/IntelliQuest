from django.shortcuts import render
from django.http import JsonResponse
from .models import Paper, Author
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

#Search in CORE API
def make_CORE_request(endpoint, query_params = None):
    url = f'https://api.core.ac.uk/v3/{endpoint}'

    query_params['api-key'] = CORE_API_KEY

    try:
        response = requests.get(url,params = query_params)
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
        response = requests.get(url, params=query_params, headers=headers, timeout=2)
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

    results = Paper.objects.filter(paperID__icontains = query)

    paper_info = []

    if not results:
        results = get_paper_details(query)
    
    for paper in results:
        authors_name = list(paper.authors.values_list('name', flat=True))
        paper_info.append({
            'title': paper.title,
            'paperID': paper.paperID,
            'year': paper.year,
            'abstract': paper.abstract,
            'authors': authors_name
        })

    return JsonResponse(paper_info, safe=False)

    
def get_paper_details(paper_id):
    query_params = {'fields' : 'title,year,authors.name,abstract'}
    paper_details = make_semantic_scholar_request(f'paper/{paper_id}', query_params=query_params)
    if paper_details:
        time.sleep(0.4)
    return paper_details
    

def search_articles(request):
    query = request.GET.get('query', '')

    #Search in Local Database
    db_results = Paper.objects.filter(title__icontains = query)
    
    existing_paper_ids = set(Paper.objects.values_list('paperID', flat=True))

    combined_results = []

    intermediate_results = []

    query_params = {'query': query, 'limit':10}

    api_results_semanticsearch = make_semantic_scholar_request('paper/search', query_params=query_params)
    #Check response status

    if api_results_semanticsearch and 'data' in api_results_semanticsearch:

        for paper in api_results_semanticsearch['data']:
            """
            if not Paper.objects.filter(paperID = paper['paperId']).exists():
            """
            if paper['paperId'] not in existing_paper_ids:
                paper_details = get_paper_details(paper['paperId'])
                if paper_details:
                    if paper_details.get('abstract'):
                        abstract = paper_details['abstract']
                    else:
                        abstract = 'Abstract not available.'
                    
                    new_paper = Paper.objects.create(
                        title=paper_details['title'],
                        paperID=paper['paperId'],
                        year=paper_details.get('year'),
                        abstract=abstract
                    )

                    for author_new in paper_details['authors']:
                        """ 
                        Refactoring to get_or_create
                        if Author.objects.filter(authorID = author_new['authorId']).exists():
                            new_author = Author.objects.get(authorID = author_new['authorId'])
                        else:
                            new_author = Author.objects.create(
                                authorID = (author_new['authorId']),
                                name = author_new['name']
                            )
                             """
                        new_author, created = Author.objects.get_or_create(
                            authorID=author_new['authorId'],
                            defaults={'name': author_new['name']}
                        )

                        new_paper.authors.add(new_author)
                    intermediate_results.append(new_paper)
                    new_paper.save()

    query_params={'page' : 1,
                  'pageSize' : 4,
                  'q' : query}
    
    api_results_coresearch = make_CORE_request('search/works', query_params=query_params)

    new_papers = []

    new_authors_relations = []

    if api_results_coresearch and 'results' in api_results_coresearch:
        for paper in api_results_coresearch['results']:
            if paper['id'] not in existing_paper_ids:
                if paper['abstract']:
                    abstract = paper['abstract']
                else: 
                    abstract = 'Abstract not available.'
                new_paper = Paper(
                    title=paper['title'],
                    paperID=paper['id'],
                    year=paper['yearPublished'],
                    abstract=abstract
                )
                new_papers.append(new_paper)
                existing_paper_ids.add(paper['id'])

        #Paper.objects.bulk_create(new_papers)

        new_papers_lookup = {paper.paperID: paper for paper in Paper.objects.filter(paperID__in=[p.paperID for p in new_papers])}
    
        for paper in api_results_coresearch['results']:
            for author_data in paper.get('authors', []):
                author, created = Author.objects.get_or_create(
                    name=author_data['name'],
                    defaults={'authorID': str(uuid.uuid4())}
                )
                if paper['id'] in new_papers_lookup:
                    new_authors_relations.append(
                        Paper.authors.through(paper_id=new_papers_lookup[paper['id']].id, author_id=author.id)
                    )

        Paper.authors.through.objects.bulk_create(new_authors_relations, ignore_conflicts=True)
    
    

    # Assuming db_results is already populated
    for paper in list(db_results) + new_papers:
        authors_name = [author.name for author in paper.authors.all()]
        combined_results.append({
            'title': paper.title,
            'paperID': paper.paperID,
            'year': paper.year,
            'abstract': paper.abstract,
            'authors': authors_name
        })

    return JsonResponse({'results': combined_results})
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