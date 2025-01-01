import requests
from django.db import models
from simple_history.models import HistoricalRecords

class Hasta(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    CLINIC_CHOICES = [
        ("Endocrinology_and_Diabetes", "Endocrinology and Diabetes"),
        ("Cardiology", "Cardiology"),
        ("Gynecology", "Gynecology"),
        ("Pediatrics", "Pediatrics"),
        ("Orthopedics", "Orthopedics"),
    ]
    INSURANCE_CHOICES = [
        ("private", "Private"),
        ("public", "Public"),
        ("none", "None"),
    ]
    APPOINTMENT_DURATION = [
        ("15", "15 Minutes"),
        ("30", "30 Minutes"),
        ("60", "1 Hour"),
    ]
    # hasta information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    place_of_birth = models.CharField(max_length=50, null=True)
    national_id = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES, null=True, blank=True)
    father = models.CharField(max_length=50)
    mother = models.CharField(max_length=50)
    # Klinik bilgileri
    clinic_name = models.CharField(max_length=50, choices=CLINIC_CHOICES, blank=True)
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.TimeField(null=True, blank=True)
    reason_for_appointment = models.TextField(null=True, blank=True)

    # iletişim bilgileri
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # ek bilgiler
    insurance_type = models.CharField(max_length=50 ,choices=INSURANCE_CHOICES, null=True, blank=True)
    medical_file_number = models.CharField(max_length=50, null=True, blank=True)
    appointment_duration = models.CharField(max_length=50, choices=APPOINTMENT_DURATION, null=True, blank=True)
    is_emergency = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)

    # --------------------------------------------------------------------------------------------------------------------------------------------------

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"