import json
from django.core.management.base import BaseCommand
from IntelliQuest_v1.models import Paper, Author

class Command(BaseCommand):
    help = 'Load a JSON file of paper details into the database'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='The path to the JSON file')

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']
        
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            papers_data = [json.loads(line) for line in json_file]


            for paper_dict in papers_data['data']:
                paper_authors = paper_dict.pop('authors', [])
                paper_obj, created = Paper.objects.create(
                    title = paper_dict['title'],
                    year = paper_dict['year'],
                    paper_id = paper_dict['CorpusId']
                )
                
                for authorId, author_name in paper_authors:
                    author_obj, created = Author.objects.get_or_create(authorID=authorId, name=author_name)
                    paper_obj.authors.add(author_obj)

                self.stdout.write(self.style.SUCCESS(f'Successfully loaded paper: {paper_obj.title}'))

