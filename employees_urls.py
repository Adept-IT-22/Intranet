# employees/urls.py
from django.urls import path
from . import views

app_name = "employees"

urlpatterns = [
    path("ping/", views.ping, name="ping"),
    path("all/", views.all_users, name="all_users"),
]
