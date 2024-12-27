from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.db.models import Q
from django.contrib.auth.mixins import LoginRequiredMixin
from hasta.models import (
    Hasta,
)
from doktor.models import Doktor
from django.http import HttpResponseRedirect
from django.urls import reverse
from urllib.parse import urlencode
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    HastaSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from emergency_situation.models import EmergencySituation
from emergency_situation.serializers import EmergencySituationSerializer
from rest_framework import generics



class HastaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Hasta.objects.all()
    serializer_class = HastaSerializer
    http_method_names = ["get", "post", "put"]
    search_fields = ["first_name", "last_name", "national_id"]
    filter_backends = [filters.SearchFilter]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()  # Create a mutable copy of request.data

        try:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()  

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)



