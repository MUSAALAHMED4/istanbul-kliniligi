from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from doktor.models import Doktor, Visit, VisitRequester
from hasta.models import Hasta, Family
from .serializers import DoktorSerializer, VisitSerializer, VisitRequesterSerializer
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


class DoktorVisitsView(LoginRequiredMixin, View):
    def get(self, request):
        data = {}
        data["title"] = "Doktor Visits"
        data["heading"] = "Doktor Visits"
        data["subheading"] = "Doktor Visits"
        data["visits"] = Visit.objects.all()
        return render(request, "doktor/visits.html", data)


class DoktorVisitEditView(LoginRequiredMixin, View):
    def get(self, request, pk):
        data = {}
        data["title"] = "Doktor Visit"
        data["heading"] = "Doktor Visit"
        data["subheading"] = "Doktor Visit"
        data["visit"] = Visit.objects.get(pk=pk)
        data["hastalar"] = Hasta.objects.all()
        data["doktors"] = Doktor.objects.all()
        data["families"] = Family.objects.all()
        data["visit_requesters"] = VisitRequester.objects.all()
        return render(request, "doktor/visit-edit.html", data)

    def post(self, request, pk):
        data = {}
        data["title"] = "Doktor"
        data["heading"] = "Doktor"
        data["subheading"] = "Doktor"
        visit = Visit.objects.get(pk=pk)
        visit.hasta_id = request.POST["hasta"]
        visit.doktor_id = request.POST["doktor"]
        visit.family_id = request.POST["family"]
        visit.visit_purpose = request.POST["purpose"]
        visit.save()
        data["visit"] = visit
        return redirect("visit-list")


class DoktorVisitAddView(LoginRequiredMixin, View):
    def get(self, request):
        data = {}
        data["title"] = "Doktor Visit"
        data["heading"] = "Doktor Visit"
        data["subheading"] = "Doktor Visit"
        data["hastalar"] = Hasta.objects.all()
        data["doktor"] = Doktor.objects.all()
        data["families"] = Family.objects.all()
        data["visit_requesters"] = VisitRequester.objects.all()
        return render(request, "doktor/visit-new.html", data)

    def post(self, request):
        data = {}
        data["title"] = "Doktor Visit"
        data["heading"] = "Doktor Visit"
        data["subheading"] = "Doktor Visit"
        visit = Visit()
        visit.hasta_id = request.POST["hasta"]
        visit.doktor_id = request.POST["doktor"]
        visit.family_id = request.POST["family"]
        # visit.visit_date = request.POST['visit_date']
        # visit.visit_requester_id = request.POST['visit_requester']
        visit.visit_requester = request.user
        visit.visit_purpose = request.POST["purpose"]
        visit.duration = 0
        visit.visit_status = "pending"
        visit.save()
        data["visit"] = visit
        return redirect("visit-list")


class VisitRequestersView(LoginRequiredMixin, View):
    def get(self, request):
        data = {}
        data["title"] = "Visit Requesters"
        data["heading"] = "Visit Requesters"
        data["subheading"] = "Visit Requesters"
        data["visit_requesters"] = VisitRequester.objects.all()
        return render(request, "doktor/visit-requester-list.html", data)


class VisitRequesterEditView(LoginRequiredMixin, View):
    def get(self, request, pk):
        data = {}
        data["title"] = "Visit Requester"
        data["heading"] = "Visit Requester"
        data["subheading"] = "Visit Requester"
        data["visit_requester"] = VisitRequester.objects.get(pk=pk)
        return render(request, "doktor/visit-requester-edit.html", data)

    def post(self, request, pk):
        data = {}
        data["title"] = "Visit Requester"
        data["heading"] = "Visit Requester"
        data["subheading"] = "Visit Requester"
        visit_requester = VisitRequester.objects.get(pk=pk)
        visit_requester.name = request.POST["name"]
        visit_requester.save()
        data["visit_requester"] = visit_requester
        return redirect("visit-requester-list")


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


class VisitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    http_method_names = ["get", "post", "put"]
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "doktor__hasta__first_name",
        "doktor__hasta__last_name",
        "family__title",
        "hasta__first_name",
        "hasta__last_name",
    ]

    def get_queryset(self):
        user = self.request.user
        try:
            if user.groups.filter(name="doktor").exists():
                return Visit.objects.filter(doktor=user.doktor)
        except:
            pass
        return super().get_queryset().order_by("-visit_date")

    def create(self, request, *args, **kwargs):
        request.data["visit_requester"] = request.user.id
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        request.data["visit_requester_id"] = request.user.id
        return super().update(request, *args, **kwargs)


class VisitRequesterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = VisitRequester.objects.all()
    serializer_class = VisitRequesterSerializer
    http_method_names = ["get", "post", "put"]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "id"]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
