from django.contrib import admin
from .models import Hasta 

class HastaAdmin(admin.ModelAdmin):
    search_fields = ['first_name', 'last_name']  
    list_filter = ['gender', 'date_of_birth']


admin.site.register(Hasta, HastaAdmin)