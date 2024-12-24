from event import views
from rest_framework.routers import DefaultRouter


event_router = DefaultRouter()
event_router.register('event', views.EventViewSet)
event_router.register('shift', views.ShiftViewSet)