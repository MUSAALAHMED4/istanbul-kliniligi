from django.urls import path
from doktor import views
from rest_framework.routers import DefaultRouter

doktor_router = DefaultRouter()
doktor_router.register('doktors', views.DoktorViewSet)
doktor_router.register('visits', views.VisitViewSet)
doktor_router.register('visit-requesters', views.VisitRequesterViewSet)



urlpatterns = [
    path('doktor', views.DoktorView.as_view(), name='doktor-list'),
    path('doktor/<int:pk>', views.DoktorEditView.as_view(), name='doktor-edit'),
    path('doktor-add', views.DoktorAddView.as_view(), name='doktor-add'),

    path('visit', views.DoktorVisitsView.as_view(), name='visit-list'),
    path('visit/<int:pk>', views.DoktorVisitEditView.as_view(), name='visit-edit'),
    path('visit-add', views.DoktorVisitAddView.as_view(), name='visit-add'),

    path('visit-requester', views.VisitRequestersView.as_view(), name='visit-requester-list'),
    path('visit-requester/<int:pk>', views.VisitRequesterEditView.as_view(), name='visit-requester-edit'),
]
