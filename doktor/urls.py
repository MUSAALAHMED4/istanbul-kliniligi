from django.urls import path
from doktor import views
from rest_framework.routers import DefaultRouter

doktor_router = DefaultRouter()
doktor_router.register('doktors', views.DoktorViewSet)



urlpatterns = [
    path('doktor', views.DoktorView.as_view(), name='doktor-list'),
    path('doktor/<int:pk>', views.DoktorEditView.as_view(), name='doktor-edit'),
    path('doktor-add', views.DoktorAddView.as_view(), name='doktor-add'),

]
