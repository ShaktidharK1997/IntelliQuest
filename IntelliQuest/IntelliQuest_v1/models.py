from django.db import models

class Author(models.Model):
    authorID = models.CharField(primary_key=True, max_length=50)
    name = models.CharField(max_length=150)
    email = models.EmailField(null=True)

class Paper(models.Model):
    paperID = models.CharField(primary_key=True, max_length=50)
    year = models.IntegerField(null=True)
    title = models.CharField(max_length=512)
    abstract = models.TextField()
    authors = models.ManyToManyField(Author, through='PaperAuthors', related_name='papers')

class PaperAuthors(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, to_field='authorID')
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, to_field='paperID')
