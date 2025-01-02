from rest_framework import serializers
from .models import (
    Hasta,
)

class Meta:
        model = Hasta
        fields = "__all__"
        extra_kwargs = {
            "father": {
                "help_text": "Reference to the father of the hasta."
            },
            "mother": {
                "help_text": "Reference to the mother of the hasta."
            },
            "last_name": {
                "help_text": "Last name of the hasta. mandatory when is_draft is False."
            },
            "first_name": {
                "help_text": "First name of the hasta. mandatory when is_draft is False."
            },
            "date_of_birth": {
                "help_text": "Date of birth of the hasta. mandatory when is_draft is False."
            },
            "gender": {
                "help_text": "Gender of the hasta. mandatory when is_draft is False."
            },
            "mobile_number": {
                "help_text": "Mobile number of the hasta. mandatory when is_draft is False."
            },
            "email": {"help_text": "Email address of the hasta."},
            "address": {
                "help_text": "Home address of the hasta. mandatory when is_draft is False."
            },
            "created_at": {"help_text": "Timestamp when this record was created."},
            "updated_at": {"help_text": "Timestamp when this record was last updated."},
            "notes": {"help_text": "Additional notes about the hasta."},
        }

        # List of mandatory fields when is_draft is False
        mandatory_fields = [
            "last_name",
            "first_name",
            "date_of_birth",
            "national_id",
            "gender",
            "mobile_number",
            "address",
            "status",
        ]



class HastaNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hasta
        fields = ["id", "first_name", "last_name", "name"]
