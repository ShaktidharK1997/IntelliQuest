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
    papersource =  models.BigIntegerField(null= True)

class PaperDetail(models.Model):
    paper = models.OneToOneField(Paper, on_delete=models.CASCADE, related_name='detail')
    citationcount = models.IntegerField(null = False)
    pubvenue = models.CharField(max_length = 256)
    downloadlink = models.URLField(max_length = 200, null = True)


class PaperAuthors(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, to_field='authorID')
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, to_field='paperID')
