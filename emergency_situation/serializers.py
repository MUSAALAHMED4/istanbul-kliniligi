from rest_framework import serializers

from .models import EmergencySituation
from hasta.serializers import HastaNameSerializer
from hasta.models import Hasta


class EmergencySituationSerializer(serializers.ModelSerializer):
    hasta = HastaNameSerializer(read_only=True, required=False)
    applicant = HastaNameSerializer(read_only=True, required=False)

    hasta_id = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), source='hasta', write_only=True, required=False)
    applicant_id = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), source='applicant', write_only=True, required=False)

    class Meta:
        model = EmergencySituation
        fields = '__all__'
