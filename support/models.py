from django.db import models
from hasta.models import Hasta
from doktor.models import Doktor, Visit
import json
from datetime import datetime


class SupportType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Support Type'
        verbose_name_plural = 'Support Types'


class Support(models.Model):
    support_type = models.ForeignKey(SupportType, on_delete=models.CASCADE, null=True, blank=True)
    hasta = models.ForeignKey(Hasta, on_delete=models.CASCADE, null=True, blank=True)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, null=True, blank=True)
    emrgency_situation = models.ForeignKey('emergency_situation.EmergencySituation', on_delete=models.CASCADE, null=True, blank=True)
    doktor = models.ForeignKey(Doktor, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('suggested', 'Suggested'), ('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=[('once', 'Once'), ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('yearly', 'Yearly')], default='daily')
    additional_info = models.TextField(null=True, blank=True)
    doktor_notes = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.doktor and self.visit:
            self.doktor = self.visit.doktor

        if not self.hasta and self.visit:
            self.hasta = self.visit.hasta

        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Support'
        verbose_name_plural = 'Supports'

        unique_together = ['support_type', 'visit', 'frequency']


class SupportCriteria(models.Model):
    support_type = models.ForeignKey(SupportType, on_delete=models.CASCADE)
    title = models.TextField()
    extra_info = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if isinstance(self.extra_info, str):
            self.extra_info = json.loads(self.extra_info)
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Support Criteria'
        verbose_name_plural = 'Support Criterias'


class SupportApproval(models.Model):
    support = models.ForeignKey(Support, on_delete=models.CASCADE)
    manager = models.ForeignKey(Doktor, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[('waiting', 'Waiting'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='waiting')
    approved_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.support.support_type.name + ' - ' + self.support.hasta.first_name + ' - ' + self.support.family.title
    
    class Meta:
        verbose_name = 'Support Approval'
        verbose_name_plural = 'Support Approvals'