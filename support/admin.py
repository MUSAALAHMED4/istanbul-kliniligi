from django.contrib import admin
from .models import Support, SupportType, SupportCriteria, SupportApproval


admin.site.register(Support)
admin.site.register(SupportType)
admin.site.register(SupportCriteria)
admin.site.register(SupportApproval)
