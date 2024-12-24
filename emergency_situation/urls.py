from emergency_situation import views
from rest_framework.routers import DefaultRouter

situation_router = DefaultRouter()
situation_router.register('emergency-situation', views.EmergencySituationView)
