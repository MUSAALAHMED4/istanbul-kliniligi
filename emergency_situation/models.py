from django.db import models
class EmergencySituation(models.Model):
    SUPPORT_CATEGORY_CHOICES = [
        ("relief", "Relief"),
        ("medical", "Medical"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("approved", "Approved")
    ]
    SUPPORT_DURATION = [
        ("day", "Day"),
        ("week", "Week"),
        ("month", "Month"),
        ("year", "Year"),
        ("custom", "Custom"),
    ]
    
    SUPPORT_TYPES = [
        ("bim cards", "Bim Cards"),
        ("monetary amount", "Monetary Amount"),
        ("custom", "Custom"),
    ]
    
    hasta = models.ForeignKey(
        "hasta.Hasta",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="hasta",
    )
    applicant = models.ForeignKey(
        "hasta.Hasta",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="applicant",
    )
    support_category = models.CharField(
        max_length=10, choices=SUPPORT_CATEGORY_CHOICES, default="help"
    )
    description = models.TextField()
    request_file = models.FileField(
        upload_to="emergency_situation/requests", blank=True, null=True
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    approved_request_file = models.FileField(
        upload_to="emergency_situation/approved_requests/", blank=True, null=True
    )
    support_documents = models.FileField(
        upload_to="emergency_situation/support_documents/", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # support type
    support_type = models.CharField(
        max_length=20, choices=SUPPORT_TYPES, default="bim cards"
    )
    custom_support_type = models.CharField(max_length=100, blank=True, null=True)

    # duration
    support_duration = models.CharField(max_length=20, blank=True, null=True)
    support_duration_type = models.CharField(max_length=20, choices=SUPPORT_DURATION, default="day")
    custom_duration_description = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.id} - {self.description[:20]}"
