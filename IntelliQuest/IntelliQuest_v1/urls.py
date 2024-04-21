from django.urls import path, include

from . import views
from .views import CreateUserView, LoginView, UserProfileView

from rest_framework.routers import DefaultRouter

router = DefaultRouter()


#Routing basic search to search_results view
urlpatterns = [
    path('', views.search_articles, name='search_articles'),
    path('search/', views.search_articles, name='search_articles'),
    path('paper/', views.get_paper_info, name= 'search_paper'),
    # path('signin/', views.sign_in, name='sign_in'),
    # path('signup/', views.sign_up, name='sign_up'),
    # path('social-auth/', include('social_django.urls', namespace='social')),
    
    path('signin/', LoginView.as_view(), name='login'),
    path('signup/', CreateUserView.as_view(), name='signup'),
    path('myprofile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('myprofile/update_picture/<str:username>/', UserProfileView.as_view(), name='user-profile-update-picture'),

]
