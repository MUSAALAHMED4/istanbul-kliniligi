from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from support.models import Support, SupportType, SupportCriteria, SupportApproval
from hasta.models import Hasta, Family
from doktor.models import Doktor, Visit
from django.contrib.auth.decorators import login_required
from .serializers import SupportSerializer, SupportTypeSerializer, SupportCriteriaSerializer, SupportApprovalSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class SupportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Support.objects.all()
    serializer_class = SupportSerializer
    http_method_names = ['get', 'post', 'put']

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('visit_id', openapi.IN_QUERY, description="Filter by visit ID", type=openapi.TYPE_INTEGER)
    ])
    def get_queryset(self):
        queryset = Support.objects.all()
        visit_id = self.request.query_params.get('visit_id', None)
        if visit_id is not None:
            queryset = queryset.filter(visit_id=visit_id)
        return queryset

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    

class SupportTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = SupportType.objects.all()
    serializer_class = SupportTypeSerializer
    http_method_names = ['get', 'post', 'put']

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    

class SupportCriteriaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = SupportCriteria.objects.all()
    serializer_class = SupportCriteriaSerializer
    http_method_names = ['get', 'post', 'put']

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    

class SupportApprovalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = SupportApproval.objects.all()
    serializer_class = SupportApprovalSerializer
    http_method_names = ['get', 'post', 'put']

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)