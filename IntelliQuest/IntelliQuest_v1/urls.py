from django.urls import path, include

from . import views
from .views import CreateUserView, LoginView, UserProfileView, EducationView, ExperienceView, PublicationsView, UpdateProfilePictureView, BookmarkedView

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
    
    path('signup/', CreateUserView.as_view(), name='signup'),
    path('signin/', LoginView.as_view(), name='login'),
    path('myprofile/<str:email>/', UserProfileView.as_view(), name='user-profile'),
    path('myprofile/update_picture/<str:email>/', UpdateProfilePictureView.as_view(), name='user-profile-update-picture'),
 
    path('myprofile/education/<str:email>/', EducationView.as_view(), name='education-list-create'),
    path('myprofile/education/<str:email>/<int:edu_id>/', EducationView.as_view(), name='education-update-delete'),
   
    path('myprofile/experience/<str:email>/', ExperienceView.as_view(), name='experience-list-create'),
    path('myprofile/experience/<str:email>/<int:exp_id>/', ExperienceView.as_view(), name='experience-update-delete'),

    path('myprofile/publications/<str:email>/', PublicationsView.as_view(), name='publications-list-create'),
    path('myprofile/publications/<str:email>/<int:pub_id>/', PublicationsView.as_view(), name='publications-update-delete'),

    path('myprofile/bookmarked/<str:email>/', BookmarkedView.as_view(), name='get_post_bookmarked'),
    path('myprofile/bookmarked/<str:email>/<str:paper_id>/', BookmarkedView.as_view(), name='update_delete_bookmarked'),


]
