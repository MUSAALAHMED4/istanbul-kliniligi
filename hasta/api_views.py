
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Hasta, Family
from .serializers import HastaSerializer, FamilySerializer


class FamilyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Family.objects.all()
    serializer_class = FamilySerializer


class HastaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Hasta.objects.all()
    serializer_class = HastaSerializer
