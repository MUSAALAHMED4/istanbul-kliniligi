from rest_framework.routers import DefaultRouter
from .views import HastaViewSet

hasta_router = DefaultRouter()
hasta_router.register('hastalar', HastaViewSet)