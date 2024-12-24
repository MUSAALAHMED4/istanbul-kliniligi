from django.contrib import admin
from .models import Event, Shift, Queue, QueuePage


admin.site.register(Event)
admin.site.register(Shift)
admin.site.register(Queue)
admin.site.register(QueuePage)


