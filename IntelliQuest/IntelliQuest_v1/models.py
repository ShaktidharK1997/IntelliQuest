from django.db import models

# Create your models here.

class Author(models.Model):
    authorID = models.CharField(primary_key = True, max_length = 50, default = 'default_test')
    name = models.CharField(max_length = 150)
    email =models.EmailField(null = True)
    


class Paper(models.Model):
    paperID = models.CharField(primary_key= True)
    year = models.IntegerField(null=True)
    authors = models.ManyToManyField(Author, related_name = 'papers')
    title = models.CharField(max_length = 512)
    abstract = models.TextField()

    def __str__(self):
        return self.title

