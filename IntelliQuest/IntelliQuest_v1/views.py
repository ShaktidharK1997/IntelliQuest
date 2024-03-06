from django.shortcuts import render
from django.http import JsonResponse
from .models import Paper, Author
import requests 
import time
from django_ratelimit.decorators import ratelimit

from requests.exceptions import RequestException

SEMANTIC_SCHOLAR_API_KEY = '8kxH5DVIYTaE4X2naV3l83RYdf0bYxg7DSFdd7U3'

# Create your views here.
#Search in Semantic Scholar API 
def make_semantic_scholar_request(endpoint, query_params= None):
    url = f'https://api.semanticscholar.org/graph/v1/{endpoint}'
    headers = {'x-api-key': SEMANTIC_SCHOLAR_API_KEY}
    try:
        response = requests.get(url, params=query_params, headers=headers)
        response.raise_for_status()
        return response.json()
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

    combined_results = []

    intermediate_results = []


    query_params = {'query': query, 'limit':10}

    api_results = make_semantic_scholar_request('paper/search', query_params=query_params)
    #Check response status
    for paper in api_results['data']:
            
        if not Paper.objects.filter(paperID = paper['paperId']).exists():
            paper_details = get_paper_details(paper['paperId'])
            if paper_details:
                if paper_details.get('abstract'):
                    abstract = paper_details['abstract']
                else:
                    abstract = 'Abstract not available'
                
                new_paper = Paper.objects.create(
                    title=paper_details['title'],
                    paperID=paper['paperId'],
                    year=paper_details.get('year'),
                    abstract=abstract
                )

                for author_new in paper_details['authors']:
                    if Author.objects.filter(authorID = author_new['authorId']).exists():
                        new_author = Author.objects.get(authorID = author_new['authorId'])
                    else:
                        new_author = Author.objects.create(
                            authorID = (author_new['authorId']),
                            name = author_new['name']
                        )
                    new_paper.authors.add(new_author)
                intermediate_results.append(new_paper)
                new_paper.save()

    for paper in db_results:
        authors_name = list(paper.authors.values_list('name', flat=True))
        combined_results.append({
            'title': paper.title,
            'paperID': paper.paperID,
            'year': paper.year,
            'abstract': paper.abstract,
            'authors': authors_name
        })

    for paper in intermediate_results:
        if not paper in combined_results:
            authors_name = list(paper.authors.values_list('name', flat=True))
            combined_results.append({
            'title': paper.title,
            'paperID': paper.paperID,
            'year': paper.year,
            'abstract': paper.abstract,
            'authors': authors_name
            })
    
    return JsonResponse({'results': combined_results})
