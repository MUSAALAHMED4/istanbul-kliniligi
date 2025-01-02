from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from doktor.models import Doktor
from hasta.models import Hasta
from .serializers import DoktorSerializer
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.utils import IntegrityError


class DoktorView(LoginRequiredMixin, View):
    def get(self, request):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        data["doktors"] = Doktor.objects.all()
        return render(request, "doktor/doktor-list.html", data)


class DoktorEditView(LoginRequiredMixin, View):
    def get(self, request, pk):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        data["doktor"] = Doktor.objects.get(pk=pk)
        data["hastalar"] = Hasta.objects.all()
        data["doktor"] = Doktor.objects.all()
        return render(request, "doktor/doktor-edit.html", data)

    def post(self, request, pk):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        doktor = Doktor.objects.get(pk=pk)
        doktor.hasta_id = request.POST["hasta"]
        doktor.manager_id = request.POST["manager"]
        doktor.position = request.POST["position"]
        doktor.save()
        data["doktor"] = doktor
        # return render (request,'doktor/doktor-edit.html', data)
        return redirect("doktor-list")


class DoktorAddView(LoginRequiredMixin, View):
    def get(self, request):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        data["hastalar"] = Hasta.objects.all()
        data["doktor"] = Doktor.objects.all()
        return render(request, "doktor/doktor-new.html", data)

    def post(self, request):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        doktor = Doktor()
        doktor.hasta_id = request.POST["hasta"]
        doktor.manager_id = request.POST["manager"]
        doktor.position = request.POST["position"]
        doktor.save()
        data["doktor"] = doktor
        return redirect("doktor-list")




class DoktorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Doktor.objects.all()
    serializer_class = DoktorSerializer
    http_method_names = ["get", "post", "put"]
    filter_backends = [filters.SearchFilter]
    search_fields = ["hasta__first_name", "hasta__last_name", "position"]

    def get_queryset(self):
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError as e:
            return Response(
                {"error": "Doktor already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

