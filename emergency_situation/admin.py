from django.contrib import admin
from .models import EmergencySituation

class EmergencySituationAdmin(admin.ModelAdmin):
    search_fields = ['description', 'status', 'support_type', 'support_category'] 
    list_filter = ['status', 'support_category', 'support_type']

admin.site.register(EmergencySituation, EmergencySituationAdmin)