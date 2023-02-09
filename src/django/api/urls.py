from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from api import views

urlpatterns = [
    path("example/", views.example),
    path("version/", views.version),
]
urlpatterns = format_suffix_patterns(urlpatterns)
