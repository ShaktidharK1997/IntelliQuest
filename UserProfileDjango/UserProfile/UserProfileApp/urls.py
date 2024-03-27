from django.urls import path, include
from .views import PersonalInfoView, EducationViewSet, upload_profile_picture
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
# router = DefaultRouter()
# router.register('education', EducationViewSet) # No need for as_view() with routers

urlpatterns = [
    path('personalinfo/<str:username>/', PersonalInfoView.as_view(), name='personalinfo-by-username'),
    path('upload_profile_picture/<str:username>/', upload_profile_picture, name='upload-profile-picture'),
    path('personalinfo/', PersonalInfoView.as_view(), name='personal-info'),
    path('education/',EducationViewSet.get_queryset)
    # path('Education/', EducationViewSet.as_view()),
    # # Include the router urls
    # path('personalinfo/', include(router.urls)),
]
