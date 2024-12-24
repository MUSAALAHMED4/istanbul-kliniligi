"""tijuana URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from .views import swagger_view
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, DashboardViewSet
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import re_path as url
from hasta.urls import hasta_router
from doktor.urls import doktor_router
from support.urls import support_router
from event.urls import event_router
from emergency_situation.urls import situation_router
from userprofile.urls import userprofile_router
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static
from userprofile.views import reset_password


schema_view = get_schema_view(
    openapi.Info(title="Tijuana API", default_version='v1'),
    public=True,
)



router = DefaultRouter()
router.registry.extend(hasta_router.registry)
router.registry.extend(doktor_router.registry)
router.registry.extend(support_router.registry)
router.registry.extend(event_router.registry)
router.registry.extend(userprofile_router.registry)
router.registry.extend(situation_router.registry)
router.register('dashboard', DashboardViewSet, basename='dashboard')


urlpatterns = [
    path('admin/', admin.site.urls),
    # Api
    path('api/v1/', include(router.urls)),
    # auth-allath
    path('account/', include('allauth.urls')),
    
    # auth
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/v1/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # swagger docs
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    # url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^$', swagger_view, name='schema-swagger-ui'),
    url(r'^$', swagger_view, name='dashboard'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    url(r'^health/', include('health_check.urls')),

    # reset password
    path('reset-password/', reset_password, name='reset_password'),

]

urlpatterns += staticfiles_urlpatterns()

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)