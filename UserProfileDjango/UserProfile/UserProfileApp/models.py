from django.db import models
from django.conf import settings

# Create your models here.

# PersonlInfo has basic personal information of a profile
class PersonalInfo(models.Model):
    # Assuming you have a User model for authentication, 
    # you can link personal info to the user
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    location = models.CharField(max_length=100)
    email = models.EmailField(unique = True)
    contact = models.CharField(max_length=15)
    # Additional fields as needed

class Education(models.Model):
    # Link to the PersonalInfo or User model
    personal_info = models.ForeignKey(PersonalInfo, related_name='education', on_delete=models.CASCADE)
    # Alternatively, link directly to a User if using Django's built-in user model
    # user = models.ForeignKey('auth.User', related_name='education', on_delete=models.CASCADE)
    university = models.CharField(max_length=255)
    degree = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    # Additional fields as needed

