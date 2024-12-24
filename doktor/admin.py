from django.contrib import admin
from .models import Doktor, VisitRequester, Visit

@admin.register(Doktor)
class DoktorAdmin(admin.ModelAdmin):
    search_fields = ['hasta_first_name', 'hasta_last_name', 'position']
    list_filter = ['position']

@admin.register(VisitRequester)
class VisitRequesterAdmin(admin.ModelAdmin):
    search_fields = ['name', 'organization', 'phone', 'email']
    list_filter = ['organization']

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    search_fields = ['doktor_hastafirst_name', 'family_title', 'visit_status']
    list_filter = ['visit_status','doktor']