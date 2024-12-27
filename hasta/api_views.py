
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Hasta
from .serializers import HastaSerializer


class HastaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Hasta.objects.all()
    serializer_class = HastaSerializer
