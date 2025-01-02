from django.contrib import admin
from .models import Doktor
@admin.register(Doktor)
class DoktorAdmin(admin.ModelAdmin):
    search_fields = ['hasta_first_name', 'hasta_last_name', 'position']
    list_filter = ['position']