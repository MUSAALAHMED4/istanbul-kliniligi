from django.http import JsonResponse
from django.shortcuts import redirect
from django.views import View  
from django.urls import reverse_lazy
from allauth.account.views import PasswordChangeView, PasswordSetView
from django.contrib.auth.mixins import LoginRequiredMixin 
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.contrib.auth.decorators import login_required
from doktor.models import Doktor, Visit
from doktor.serializers import VisitSerializer
from support.models import SupportType
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
    
 
class MyPasswordChangeView( PasswordChangeView):
    success_url = reverse_lazy('dashboard')


class MyPasswordSetView( PasswordSetView):
    success_url = reverse_lazy('dashboard')


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        visit_count = Visit.objects.count()
        doktor_count = Doktor.objects.count()
        support_type_count = SupportType.objects.count()
        pending_visits = Visit.objects.filter(visit_status='pending')
        pending_visit_serializer = VisitSerializer(pending_visits, many=True)
        completed_visits = Visit.objects.filter(visit_status='completed').count()

        response_data = {
            'visit_count': visit_count,
            'doktor_count': doktor_count,
            'support_type_count': support_type_count,
            'pending_visits': pending_visit_serializer.data,
            'completed_visits': completed_visits,
        }

        return Response(response_data)


schema_view = get_schema_view(
    openapi.Info(
        title="Tijuana API",
        default_version='v1',
        description="API documentation",
    ),
    public=True
)


@login_required
def swagger_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return schema_view.with_ui('swagger', cache_timeout=0)(request)