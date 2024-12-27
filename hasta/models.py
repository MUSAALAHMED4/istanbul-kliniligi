import requests
from django.db import models
from simple_history.models import HistoricalRecords

class Hasta(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]
    # hasta information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    father = models.CharField(max_length=50)
    mother = models.CharField(max_length=50)
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # --------------------------------------------------------------------------------------------------------------------------------------------------

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"