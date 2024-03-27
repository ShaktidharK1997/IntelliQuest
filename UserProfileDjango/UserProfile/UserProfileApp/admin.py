from django.contrib import admin

from .models import PersonalInfo, Education

admin.site.register(PersonalInfo)
admin.site.register(Education)
