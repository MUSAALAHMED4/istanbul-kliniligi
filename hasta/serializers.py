from rest_framework import serializers
from .models import (
    Hasta,
    Family,
    Income,
    Expense,
    ItemTitle,
    City,
    District,
    Neighborhood,
)

class ItemTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemTitle
        fields = "__all__"
        extra_kwargs = {
            "item_name": {"help_text": "Name of the item."},
            "item_type": {"help_text": "Type of the item (income or expense)."},
        }


class IncomeSerializer(serializers.ModelSerializer):
    title = ItemTitleSerializer()

    class Meta:
        model = Income
        fields = "__all__"
        extra_kwargs = {
            "hasta": {
                "help_text": "Reference to the Hasta this income belongs to."
            },
            "family": {"help_text": "Reference to the Family this income belongs to."},
            "title": {"help_text": "Title of the income."},
            "amount": {"help_text": "Amount of the income."},
            "created_at": {"help_text": "Timestamp when this record was created."},
            "updated_at": {"help_text": "Timestamp when this record was last updated."},
            "additional_info": {
                "help_text": "Additional information stored in JSON format."
            },
        }


class ExpenseSerializer(serializers.ModelSerializer):
    title = ItemTitleSerializer(read_only=True)
    title_id = serializers.PrimaryKeyRelatedField(
        queryset=ItemTitle.objects.all(), write_only=True
    )

    class Meta:
        model = Expense
        fields = "__all__"
        extra_kwargs = {
            "hasta": {
                "help_text": "Reference to the Hasta this expense belongs to."
            },
            "family": {"help_text": "Reference to the Family this expense belongs to."},
            "title": {"help_text": "Title of the expense."},
            "amount": {"help_text": "Amount of the expense."},
            "created_at": {"help_text": "Timestamp when this record was created."},
            "updated_at": {"help_text": "Timestamp when this record was last updated."},
            "additional_info": {
                "help_text": "Additional information stored in JSON format."
            },
        }


class HastaSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    incomes = IncomeSerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)
    partner_name = serializers.SerializerMethodField()
    father_name = serializers.SerializerMethodField()
    mother_name = serializers.SerializerMethodField()
    family_mobile_number = serializers.SerializerMethodField()
    doktor_name = serializers.SerializerMethodField()
    visit_date = serializers.SerializerMethodField()
    visit_id = serializers.SerializerMethodField()

    def get_visit_id(self, obj):
        if obj.last_updated_by_visit:
            return obj.last_updated_by_visit.id

    def get_doktor_name(self, obj):
        if obj.last_updated_by_visit:
            return obj.last_updated_by_visit.doktor.hasta.name

    def get_visit_date(self, obj):
        if obj.last_updated_by_visit:
            return obj.last_updated_by_visit.visit_date

    def get_family_mobile_number(self, obj):
        return obj.family_mobile_number

    def get_partner_name(self, obj):
        if obj.partner_id:
            return obj.partner_id.name
        return None

    def get_father_name(self, obj):
        if obj.father:
            return obj.father.name
        return None

    def get_mother_name(self, obj):
        if obj.mother:
            return obj.mother.name
        return None

    def get_name(self, obj):
        return obj.name

    class Meta:
        model = Hasta
        fields = "__all__"
        extra_kwargs = {
            "family": {
                "help_text": "Reference to the Family this hasta belongs to."
            },
            "last_name": {
                "help_text": "Last name of the hasta. mandatory when is_draft is False."
            },
            "first_name": {
                "help_text": "First name of the hasta. mandatory when is_draft is False."
            },
            "mother": {"help_text": "Reference to the mother of this hasta."},
            "father": {"help_text": "Reference to the father of this hasta."},
            "National_ID_Issue_place": {
                "help_text": "National ID issue place of the hasta."
            },
            "date_of_birth": {
                "help_text": "Date of birth of the hasta. mandatory when is_draft is False."
            },
            "place_of_birth": {
                "help_text": "Place of birth of the hasta. mandatory when is_draft is False."
            },
            "national_id": {
                "help_text": "National ID of the hasta. mandatory when is_draft is False."
            },
            "job_title": {"help_text": "Job title of the hasta."},
            "salary": {"help_text": "Salary of the hasta."},
            "gender": {
                "help_text": "Gender of the hasta. mandatory when is_draft is False."
            },
            "partner_id": {"help_text": "Reference to the partner of this hasta."},
            "partner_relation_status": {
                "help_text": "Relationship status with the partner."
            },
            "mobile_number": {
                "help_text": "Mobile number of the hasta. mandatory when is_draft is False."
            },
            "email": {"help_text": "Email address of the hasta."},
            "address": {
                "help_text": "Home address of the hasta. mandatory when is_draft is False."
            },
            "location": {
                "help_text": "Current location of the hasta. mandatory when is_draft is False."
            },
            "created_at": {"help_text": "Timestamp when this record was created."},
            "updated_at": {"help_text": "Timestamp when this record was last updated."},
            "responsible_doktor_id": {
                "help_text": "doktor responsible for this hasta."
            },
            "notes": {"help_text": "Additional notes about the hasta."},
            "additional_info": {
                "help_text": "Additional information stored in JSON format."
            },
            "is_head_of_family": {
                "help_text": "Indicates if the hasta is the head of the family."
            },
            "is_draft": {"help_text": "Indicates if this record is a draft."},
            "last_updated_by_visit": {
                "help_text": "Reference to the last visit that updated this hasta."
            },
            "status": {
                "help_text": "Status of the hasta (alive, dead, lost). mandatory when is_draft is False."
            },
        }

    def validate(self, data):
        is_draft = data.get("is_draft", False)

        # List of mandatory fields when is_draft is False
        mandatory_fields = [
            "last_name",
            "first_name",
            "date_of_birth",
            "place_of_birth",
            "national_id",
            "gender",
            "mobile_number",
            "address",
            "location",
            "status",
        ]

        marital_status = data.get("partner_relationship")
        if marital_status in ["married", "divorced", "widowed"]:
            if not data.get("partner_id"):
                raise serializers.ValidationError(
                    {
                        "partner_id": "Partner is required when marital status is married, divorced, or widowed."
                    }
                )

            if not data.get("partner_relationship_status"):
                raise serializers.ValidationError(
                    {
                        "partner_relationship_status": "Partner relationship status is required when marital status is married, divorced, or widowed."
                    }
                )

        is_working = data.get("is_working")
        if is_working:
            if not data.get("job_title"):
                raise serializers.ValidationError(
                    {"job_title": "Job title is required when is_working is True."}
                )

            if not data.get("salary"):
                raise serializers.ValidationError(
                    {"salary": "Salary is required when is_working is True."}
                )

        if not is_draft:
            for field in mandatory_fields:
                if data.get("status") in ["dead", "lost"] and field in (
                    "national_id",
                    "mobile_number",
                    "address",
                    "location",
                ):
                    continue
                if not data.get(field):
                    raise serializers.ValidationError(
                        {field: f"{field} is required when is_draft is False."}
                    )

        return data


class HastaNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hasta
        fields = ["id", "first_name", "last_name", "name"]


class FamilySerializer(serializers.ModelSerializer):
    hastalar = HastaSerializer(many=True, read_only=True)
    incomes = IncomeSerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = Family
        fields = [
            "id",
            "title",
            "title_long",
            "is_draft",
            "hastalar",
            "incomes",
            "expenses",
            "expenses_summary",
        ]


class FamilyNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ["id", "title", "title_long", "is_draft"]


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"
        extra_kwargs = {
            "name": {"help_text": "Name of the city."},
        }


class DistrictSerializer(serializers.ModelSerializer):
    city = CitySerializer()

    class Meta:
        model = District
        fields = "__all__"
        extra_kwargs = {
            "name": {"help_text": "Name of the district."},
            "city": {"help_text": "Reference to the city this district belongs to."},
        }


class NeighborhoodSerializer(serializers.ModelSerializer):
    district = DistrictSerializer()

    class Meta:
        model = Neighborhood
        fields = "__all__"
        extra_kwargs = {
            "name": {"help_text": "Name of the neighborhood."},
            "district": {
                "help_text": "Reference to the district this neighborhood belongs to."
            },
        }
