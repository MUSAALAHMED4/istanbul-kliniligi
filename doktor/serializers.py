from rest_framework import serializers
from .models import Doktor
from hasta.serializers import HastaNameSerializer
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
