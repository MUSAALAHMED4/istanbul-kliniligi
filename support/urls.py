from support import views
from rest_framework.routers import DefaultRouter

support_router = DefaultRouter()
support_router.register('support', views.SupportViewSet)
support_router.register('support-type', views.SupportTypeViewSet)
support_router.register('support-criteria', views.SupportCriteriaViewSet)
support_router.register('support-approval', views.SupportApprovalViewSet)