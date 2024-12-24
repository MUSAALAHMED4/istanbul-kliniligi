from django.contrib import admin
from .models import Family, Hasta, Income, Expense, ItemTitle

# Register family with inline expenses and incomes
class IncomeInline(admin.TabularInline):
    model = Income
    extra = 1

class ExpenseInline(admin.TabularInline):
    model = Expense
    extra = 1

class FamilyAdmin(admin.ModelAdmin):
    inlines = [IncomeInline, ExpenseInline]
    search_fields = ['title', 'id', 'hastalar__mobile_number','hastalar__address']
    # list_filter = ['title', 'id']


class HastaAdmin(admin.ModelAdmin):
    inlines = [IncomeInline, ExpenseInline]
    search_fields = ['first_name', 'last_name', 'family__title']  
    list_filter = ['family', 'gender', 'status']


admin.site.register(Family, FamilyAdmin)
admin.site.register(Hasta, HastaAdmin)
admin.site.register(ItemTitle)
