from django.db import models


class Doktor(models.Model):

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]
    
    WORK_SHIFT_CHOICES = [
        ("morning", "Morning"),
        ("afternoon", "Afternoon"),
        ("evening", "Evening"),
    ]


    # Doktor information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    place_of_birth = models.CharField(max_length=50, null=True)
    national_id = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    place_of_birth = models.CharField(max_length=50, null=True)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES, null=True, blank=True)
    father = models.CharField(max_length=50)
    mother = models.CharField(max_length=50)
    # contact information
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    # clinic information
    specialization = models.CharField(max_length=50, blank=True)
    clinic_name = models.CharField(max_length=50, blank=True)
    working_days = models.CharField(max_length=50, blank=True)
    working_hours = models.CharField(max_length=50, blank=True)
    work_shift = models.CharField(max_length=50, choices=WORK_SHIFT_CHOICES, null=True, blank=True)
    position = models.CharField(max_length=100)

 

    def __str__(self):
        return self.hasta.first_name + " " + self.hasta.last_name
