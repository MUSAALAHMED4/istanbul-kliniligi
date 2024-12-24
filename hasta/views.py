from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.db.models import Q
from django.contrib.auth.mixins import LoginRequiredMixin
from hasta.models import (
    Hasta,
    Family,
    Income,
    Expense,
    ItemTitle,
    City,
    District,
    Neighborhood,
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
    FamilySerializer,
    IncomeSerializer,
    ExpenseSerializer,
    ItemTitleSerializer,
    CitySerializer,
    DistrictSerializer,
    NeighborhoodSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .helpers import generate_genogram_payload, send_genogram_report
from emergency_situation.models import EmergencySituation
from emergency_situation.serializers import EmergencySituationSerializer
from rest_framework import generics


expense_income_map = {
    "waterBill": "Water Bill",
    "gasBill": "Gas Bill",
    "electricityBill": "Electricity Bill",
    "internetBill": "Internet Bill",
    "rentAmount": "Rent Amount",
    "salary": "Salary",
    "redCrescent": "Red Crescent",
    "otherBill": "Other Bill",
    "additionalIncome": "Additional Income",
    "additionalExpenses": "Additional Expenses",
}


class FamilyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Family.objects.all().order_by("is_draft")
    serializer_class = FamilySerializer
    http_method_names = ["get", "put"]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "id"]
    order_fields = ["is_draft", "id", "created_at"]
    ordering = ["is_draft"]

    def get_queryset(self):
        queryset = super().get_queryset()

        search_param = self.request.query_params.get("search")
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param) | Q(id__icontains=search_param)
            )

        identity_place = self.request.query_params.get("identity_place")
        if identity_place:
            if identity_place == "İSTANBUL":
                queryset = queryset.filter(
                    hastalar__national_id_issue_place__contains="ist"
                )
            else:
                queryset = queryset.filter(
                    hastalar__national_id_issue_place=identity_place
                )

        is_draft = self.request.query_params.get("is_draft")
        if is_draft == "true":
            is_draft = True
        elif is_draft == "false":
            is_draft = False
        if is_draft is not None:
            queryset = queryset.filter(is_draft=is_draft)

        health_condition = self.request.query_params.get("health_condition")
        if health_condition:
            queryset = queryset.filter(
                hastalar__condition_type=health_condition,
                hastalar__has_condition=True,
            )

        province = self.request.query_params.get("province")
        if province:
            if province == "ISTANBUL":
                queryset = queryset.filter(
                    Q(hastalar__address__contains="İstanbul")
                    | Q(hastalar__address__endswith="İst.")
                )
            else:
                queryset = queryset.filter(hastalar__address__contains=province)

        return queryset

        district = self.request.query_params.get("district")
        if district:
            queryset = queryset.filter(hastalar__address__contains=district)

        area = self.request.query_params.get("area")
        if area:
            queryset = queryset.filter(hastalar__address__contains=area)

    @action(detail=True, methods=["get"])
    def hastalar(self, request, pk=None):
        family = self.get_object()
        serializer = HastaSerializer(family.hastalar, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def emergency_situations(self, request, pk=None):
        family = self.get_object()
        emergency_situations = EmergencySituation.objects.filter(family=family)
        serializer = EmergencySituationSerializer(emergency_situations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def send_genogram_report(self, request, pk=None):
        family = Family.objects.get(pk=pk)
        payload = generate_genogram_payload(family)
        send_genogram_report(pk)
        return JsonResponse(payload, safe=False)

    @action(detail=True, methods=["put"])
    def save_information(self, request, pk=None):
        payload = request.data
        errors = []
        for item in payload:
            if item.get("amount") is None:
                continue

            if item.get("id"):
                try:
                    if item.get("type") == "income":
                        income = Income.objects.get(pk=item.get("id"))
                        income.amount = item.get("amount")
                        income.additional_info = item.get("additional_info")
                        income.save()
                    elif item.get("type") == "expense":
                        expense = Expense.objects.get(pk=item.get("id"))
                        expense.amount = item.get("amount")
                        expense.additional_info = item.get("additional_info")
                        expense.save()
                except Exception as e:
                    errors.append(str(e))
            else:
                try:
                    _item_title = expense_income_map.get(item.get("key"))
                    item_type = "income" if item.get("type") == "income" else "expense"
                    item_title, _ = ItemTitle.objects.get_or_create(
                        item_name=_item_title, item_type=item_type
                    )
                    if item_type == "income":
                        Income.objects.create(
                            family_id=pk,
                            title=item_title,
                            amount=item.get("amount"),
                            additional_info=item.get("additional_info"),
                        )
                    elif item_type == "expense":
                        Expense.objects.create(
                            family_id=pk,
                            title=item_title,
                            amount=item.get("amount"),
                            additional_info=item.get("additional_info"),
                        )
                except Exception as e:
                    errors.append(str(e))

        if errors:
            return JsonResponse({"errors": errors}, status=400)
        return JsonResponse({"message": "Information saved successfully"}, status=200)


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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        if "profile_image" in request.FILES:
            instance.profile_image = request.FILES["profile_image"]

        family_id = request.data.get("family_id")
        if family_id:
            instance.family_id = family_id

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


class IncomeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

    @action(detail=False, methods=["get"])
    def item_titles(self, request):
        item_titles = ItemTitle.objects.filter(item_type="income")
        serializer = ItemTitleSerializer(item_titles, many=True)
        return Response(serializer.data)


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    @action(detail=False, methods=["get"])
    def item_titles(self, request):
        item_titles = ItemTitle.objects.filter(item_type="expense")
        serializer = ItemTitleSerializer(item_titles, many=True)
        return Response(serializer.data)


class CityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = City.objects.all()
    serializer_class = CitySerializer
    http_method_names = ["get"]

    @action(detail=True, methods=["get"])
    def districts(self, request, pk=None):
        city = self.get_object()
        districts = District.objects.filter(city=city)
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class DistrictByCityView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    http_method_names = ["get"]

    @action(detail=True, methods=["get"])
    def neighborhoods(self, request, pk=None):
        district = self.get_object()
        neighborhoods = Neighborhood.objects.filter(district=district)
        serializer = NeighborhoodSerializer(neighborhoods, many=True)
        return Response(serializer.data)


class NeighborhoodByDistrictView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Neighborhood.objects.all()
    serializer_class = NeighborhoodSerializer
    http_method_names = ["get"]
