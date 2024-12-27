from django.db import models
from hasta.models import Hasta
from django.contrib.auth.models import User, Group


class Doktor(models.Model):
    hasta = models.OneToOneField("hasta.Hasta", on_delete=models.CASCADE)
    manager = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    position = models.CharField(max_length=100)
    extra_info = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.hasta.first_name + " " + self.hasta.last_name

    def save(self, *args, **kwargs):
        if not self.user:
            try:
                user = User.objects.create_user(
                    username=self.hasta.national_id,
                    email=self.hasta.email,
                    password=self.hasta.national_id,
                    first_name=self.hasta.first_name,
                    last_name=self.hasta.last_name,
                )
            except Exception as e:
                print(e)
                user = User.objects.get(username=self.hasta.national_id)
            if not user.groups.filter(name="doktor").exists():
                doktor_group = Group.objects.get(name="doktor")
                user.groups.add(doktor_group)
            self.user = user
        if self.manager and (self.manager == self or self.manager.manager == self):
            raise ValueError("Manager should not be the same hasta.")
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Doktor"
        verbose_name_plural = "Doktors"


class VisitRequester(models.Model):
    name = models.CharField(max_length=100)
    organization = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Visit Requester"
        verbose_name_plural = "Visit Requesters"


class Visit(models.Model):
    doktor = models.ForeignKey(Doktor, on_delete=models.CASCADE)
    hasta = models.ForeignKey(Hasta, on_delete=models.CASCADE, null=True, blank=True)
    visit_date = models.DateTimeField(auto_now_add=True)
    visit_requester = models.ForeignKey(User, on_delete=models.CASCADE)
    visit_responsible = models.ForeignKey(
        Doktor,
        on_delete=models.CASCADE,
        unique=False,
        related_name="visit_responsible",
        null=True,
        blank=True,
    )
    visit_purpose = models.TextField()
    visit_notes = models.TextField(null=True, blank=True)
    doktor_notes = models.TextField(null=True, blank=True)
    visit_status = models.CharField(
        max_length=20,
        choices=[
            ("requested", "Requested"),
            ("pending", "Pending"),
            ("completed", "Completed"),
            ("draft", "Draft"),
            ("cancelled", "Cancelled"),
        ],
        default="requested",
    )
    duration = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    extra_info = models.TextField(null=True, blank=True)


    def __str__(self):
        return self.created_at.strftime("%Y-%m-%d %H:%M:%S")
