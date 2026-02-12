from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InnovationViewSet

router = DefaultRouter()
router.register(r'innovations', InnovationViewSet, basename='innovation')

urlpatterns = [
    path('', include(router.urls)),
]

