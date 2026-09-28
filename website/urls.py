from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("reviews/submit/", views.submit_review, name="submit_review"),
]
