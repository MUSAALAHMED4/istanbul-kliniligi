from django.db import models
from doktor.models import Doktor
from support.models import SupportType
from hasta.models import Family, Hasta

class Event(models.Model):
    name = models.CharField(max_length=100)
    support_type = models.ForeignKey(SupportType, on_delete=models.CASCADE, null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)
    number_of_families = models.PositiveIntegerField(default=0, blank=True, null=True)
    number_of_families_per_shift = models.PositiveIntegerField(default=0, blank=True, null=True)
    rows_per_page = models.PositiveIntegerField(default=0, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def event_days(self):
        "Return the dates of the event."
        shifts = Shift.objects.filter(event=self)
        event_days = []
        for shift in shifts:
            if shift.date not in event_days:
                event_days.append(shift.start_time.date())
        days = list(set(event_days))
        # format the dates comma separated
        return ', '.join([day.isoformat() for day in days])

    def __str__(self):
        return self.name

class Shift(models.Model):
    
    PERIOD = [
    ('Morning', 'Morning'),
    ('Evening', 'Evening'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    date = models.DateField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    number_of_families = models.PositiveIntegerField(default=0, blank=True, null=True)
    doktors = models.ManyToManyField(Doktor, blank=True)
    period = models.CharField(max_length=10, choices=PERIOD, default='Morning')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def duration(self):
        "Return the duration of the shift in hours."
        return (self.end_time - self.start_time) / 60 / 60

    def __str__(self):
        return f'Shift on {self.start_time} - {self.end_time}'
    

class Queue(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    doktors = models.ManyToManyField(Doktor, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Queue {self.name} for Shift {self.shift.id}"


class QueuePage(models.Model):
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, null=True, blank=True)
    page_number = models.PositiveIntegerField(default=0, blank=True, null=True)
    families = models.ManyToManyField(Family, blank=True)
    hastalar = models.ManyToManyField(Hasta, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Queue Page {self.page_number} for Queue {self.queue.id}"