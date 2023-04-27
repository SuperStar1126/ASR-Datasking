from django.urls import path
from . import views

urlpatterns = [
    path('', views.index,),
    path('language', views.language),
    path('upload', views.upload)
]

