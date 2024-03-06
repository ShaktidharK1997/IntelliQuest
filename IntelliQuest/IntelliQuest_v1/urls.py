from django.urls import path, include

from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()


#Routing basic search to search_results view
urlpatterns = [
    path('search/', views.search_articles, name='search_articles'),
    path('paper/', views.get_paper_info, name= 'search_paper'),
]
