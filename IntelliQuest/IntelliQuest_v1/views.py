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
        #response = requests.get(url, params=query_params, headers=headers, timeout=2)
        response = requests.get(url, params=query_params, headers=headers)
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
    results = Paper.objects.filter(paperID__icontains=query).select_related('detail')

    paper_info = []

    for paper in results:
        # Fetch authors' names
        authors_name = list(paper.authors.values_list('name', flat=True))

        # Initialize paper detail info with default values
        detail_info = {
            'citationcount': None,
            'pubvenue': None,
            'downloadlink': None
        }

        # Try to update the detail info if the paper has detail
        try:
            detail = paper.detail
            detail_info = {
                'citationcount': detail.citationcount,
                'pubvenue': detail.pubvenue,
                'downloadlink': detail.downloadlink
            }
        except Paper.detail.RelatedObjectDoesNotExist:
            # If there's no detail, the default detail_info will be used
            pass

        # Combine paper info and detail info
        paper_data = {
            'title': paper.title,
            'paperID': paper.paperID,
            'year': paper.year,
            'abstract': paper.abstract,
            'authors': authors_name,
        }
        paper_data.update(detail_info)

        paper_info.append(paper_data)

    return JsonResponse(paper_info, safe=False)
    
def get_paper_details(paper_id):
    query_params = {'fields' : 'paperId,title,publicationVenue,year,authors.name,abstract,citationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,journal,publicationDate'}
    paper_details = make_semantic_scholar_request(f'paper/{paper_id}', query_params=query_params)
    if paper_details:
        time.sleep(0.4)
    return paper_details

def get_bulk_paper_details(paper_ids):
    endpoint = 'https://api.semanticscholar.org/graph/v1/paper/batch'
    headers = {'x-api-key': SEMANTIC_SCHOLAR_API_KEY}
    params = {'fields': 'paperId,title,publicationVenue,year,authors.name,abstract,citationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,journal,publicationDate'}
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

    #Search in Local Database
    db_results = Paper.objects.filter(title__icontains = query)
    
    #Get existing paperids in local database
    existing_paper_ids = set(Paper.objects.values_list('paperID', flat=True))

    combined_results = []

    new_papers = []

    query_params = {'query': query, 'limit':10}

    api_results_semanticsearch = make_semantic_scholar_request('paper/search', query_params=query_params)
    #Check response status

    if api_results_semanticsearch and 'data' in api_results_semanticsearch:

        paper_ids_for_batch = [paper['paperId'] for paper in api_results_semanticsearch['data'] if paper['paperId'] not in existing_paper_ids]

        # Make a single batch request for all paper details
        batch_paper_details = get_bulk_paper_details(paper_ids_for_batch)

        if batch_paper_details:
            for paper_details in batch_paper_details:
                #paper_details = batch_paper_details.get(paper_id, None)
                if paper_details:
                    # Assuming paper_details is a dictionary with paper_id as key and details as value
                    # Adjust according to the actual structure of batch_paper_details
                    abstract = paper_details.get('abstract') or 'Abstract not available.'

                    # Create or update the paper and its authors in the database
                    new_paper_summary, created_summary = Paper.objects.update_or_create(
                        paperID=paper_details['paperId'],
                        defaults={
                            'title': paper_details['title'],
                            'year': paper_details.get('year'),
                            'abstract': abstract,
                            'papersource': 1
                        }
                    )
                    
                    new_papers.append(new_paper_summary)

                    # Initialize default values
                    link = ""
                    publication_venue_name = ""

                    # Check if paper_details is not None
                        # Now it's safe to use .get() since paper_details is confirmed to be a dictionary
                    if paper_details.get('isOpenAccess'):

                        oapdf = paper_details['openAccessPdf']
                        link=oapdf['url']
                    publication_venue_name = paper_details.get('publicationVenue', {}).get('name', "")



                    new_paper_detail, created_detail = PaperDetail.objects.update_or_create(
                        paper=new_paper_summary,  # Assuming new_paper_summary is defined elsewhere
                        defaults={
                            'citationcount': paper_details.get('citationCount', 0),  # Providing a default value if missing
                            'pubvenue': publication_venue_name,
                            'downloadlink': link
                        }
                    )

                    # Process authors
                    for author_detail in paper_details['authors']:
                        new_author, created = Author.objects.get_or_create(
                            authorID=author_detail['authorId'],
                            defaults={'name': author_detail['name']}
                        )
                        new_paper_summary.authors.add(new_author)

        """
        Trying new API
        for paper in api_results_semanticsearch['data']:

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

                        new_author, created = Author.objects.get_or_create(
                            authorID=author_new['authorId'],
                            defaults={'name': author_new['name']}
                        )

                        new_paper.authors.add(new_author)
                    intermediate_results.append(new_paper)
                    new_paper.save()
        """
    query_params={'page' : 1,
                  'pageSize' : 4,
                  'q' : query}
    
    api_results_coresearch = make_CORE_request('search/works', query_params=query_params)


    new_authors_relations = []

    if api_results_coresearch and 'results' in api_results_coresearch:
        for paper in api_results_coresearch['results']:
            if paper['id'] not in existing_paper_ids:
                if paper['abstract']:
                    abstract = paper['abstract']
                else: 
                    abstract = 'Abstract not available.'

                new_paper_summary, created_summary = Paper.objects.update_or_create(
                    paperID=paper['id'],
                        defaults={
                            'title' : paper['title'],
                            'year' : paper['yearPublished'],
                            'abstract' : abstract,
                            'papersource' : 2
                        })
                
                new_paper_detail, created_detail = PaperDetail.objects.update_or_create(
                        paper=new_paper_summary,
                        defaults={
                            'citationcount': paper.get('citationCount', 0),  # Assuming default value as 0
                            'pubvenue': paper.get('publisher', 'Unknown'),  # Assuming default value as 'Unknown'
                            'downloadlink': paper.get('downloadUrl', '')  # Assuming default value as empty string
                        }
                    )


                new_papers.append(new_paper_summary)
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
            'paperID': str(paper.paperID),
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