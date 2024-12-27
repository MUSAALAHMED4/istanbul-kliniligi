from rest_framework import serializers
from .models import Doktor, VisitRequester, Visit
from hasta.serializers import HastaNameSerializer
from support.serializers import SupportSerializer
from support.models import Support
from hasta.models import Hasta
from django.contrib.auth.models import User

class DoktorNameSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.hasta.first_name + ' ' + obj.hasta.last_name
    class Meta:
        model = Doktor
        fields = ['id', 'name']

class DoktorSerializer(serializers.ModelSerializer):
    hasta = HastaNameSerializer(read_only=True, required=False)
    manager = DoktorNameSerializer(read_only=True, required=False)
    hasta_id = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), source='hasta', write_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(queryset=Doktor.objects.all(), source='manager', write_only=True, required=False)
    class Meta:
        model = Doktor
        fields = '__all__'


class VisitSerializer(serializers.ModelSerializer):
    hasta = HastaNameSerializer(read_only=True)
    visit_responsible = DoktorNameSerializer(read_only=True)
    visit_requester_name = serializers.SerializerMethodField()
    support = serializers.SerializerMethodField()
    doktor_id = serializers.SerializerMethodField()
    doktor_name = serializers.SerializerMethodField()

    hasta_id = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), source='hasta', write_only=True, required=False)
    visit_purpose = serializers.CharField(required=False)
    doktor = serializers.PrimaryKeyRelatedField(queryset=Hasta.objects.all(), required=False)
    visit_requester = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    def get_doktor_id(self, obj):
        if obj.doktor:
            return obj.doktor.id
        return None
    
    def get_doktor_name(self, obj):
        if obj.doktor:
            return obj.doktor.hasta.name
        return None

    def get_support(self, obj):
        supports = Support.objects.filter(visit=obj)
        return SupportSerializer(supports, many=True).data

    def get_visit_requester_name(self, obj):
        if obj.visit_requester:
            return obj.visit_requester.username
        return None
    
    def update(self, instance, validated_data):
        instance.visit_purpose = validated_data.get('visit_purpose', instance.visit_purpose)
        instance.doktor = validated_data.get('doktor', instance.doktor)
        instance.visit_requester = validated_data.get('visit_requester', instance.visit_requester)

        instance = super().update(instance, validated_data)

        instance.save()
        return instance
    
    def validate(self, data):
        request_method = self.context['request'].method
        if request_method == 'POST':
            # List of mandatory fields when is_draft is False
            mandatory_fields = [
                'doktor',
                'visit_purpose',
            ]
            for field in mandatory_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required.'})
        return data
    class Meta:
        model = Visit
        fields = '__all__'


class VisitRequesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitRequester
        fields = '__all__'