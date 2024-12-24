from rest_framework import serializers

from .models import Support, SupportType, SupportCriteria, SupportApproval
from hasta.serializers import HastaNameSerializer, FamilyNameSerializer
from hasta.models import Hasta, Family
from doktor.models import Visit

class SupportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportType
        fields = '__all__'


class SupportSerializer(serializers.ModelSerializer):
    hasta = HastaNameSerializer(read_only=True, required=False)
    support_type = SupportTypeSerializer(read_only=True, required=False)
    family = FamilyNameSerializer(read_only=True, required=False)
    visit_str = serializers.CharField(source='visit', read_only=True)

    hasta_id = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), source='hasta', write_only=True, required=False)
    support_type_id = serializers.PrimaryKeyRelatedField(queryset=SupportType.objects.all(), source='support_type', write_only=True, required=False)
    family_id = serializers.PrimaryKeyRelatedField(queryset=Family.objects.all(), source='family', write_only=True, required=False)
    visit = serializers.PrimaryKeyRelatedField(queryset=Visit.objects.all(), write_only=True, required=False)
    class Meta:
        model = Support
        fields = '__all__'
    
    def to_representation(self, instance):
        from doktor.serializers import DoktorNameSerializer
        response = super().to_representation(instance)
        response['doktor'] = DoktorNameSerializer(instance.doktor).data
        return response


class SupportCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportCriteria
        fields = '__all__'


class SupportApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportApproval
        fields = '__all__'

