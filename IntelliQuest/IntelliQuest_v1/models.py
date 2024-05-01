from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# Create Custom User to make email as the username

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff') or not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_staff=True and is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Here you can specify required fields other than email and password

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class PersonalProfile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_profiles")
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    location = models.CharField(max_length=100)
    contact = models.CharField(max_length=15)

    def __str__(self):
        return self.user.email

class Education(models.Model):
    personal_info = models.ForeignKey(PersonalProfile, related_name='education', on_delete=models.CASCADE)
    university = models.CharField(max_length=255)
    degree = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    is_current = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_current:
            self.end_date = None
        super(Education, self).save(*args, **kwargs)

class Experience(models.Model):
    personal_info = models.ForeignKey(PersonalProfile, related_name='experience', on_delete=models.CASCADE)
    company = models.CharField(max_length=255)
    title = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255)
    responsibilities = models.TextField()
    is_current = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_current:
            self.end_date = None
        super(Experience, self).save(*args, **kwargs)

class Publications(models.Model):
    personal_info = models.ForeignKey(PersonalProfile, related_name='publications', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    published_date = models.DateField(null=True, blank=True)
    authors = models.CharField(max_length=200)
    abstract = models.TextField()


class Bookmarked(models.Model):
    personal_info = models.ForeignKey(PersonalProfile, related_name='bookmarks', on_delete=models.CASCADE)
    paperID = models.CharField(max_length=50)
    year = models.IntegerField(null=True)
    title = models.CharField(max_length=512)
    papersource = models.BigIntegerField(null=True)

    class Meta:
        unique_together = (('personal_info', 'paperID'),)
        verbose_name_plural = "Bookmarked Papers"

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

