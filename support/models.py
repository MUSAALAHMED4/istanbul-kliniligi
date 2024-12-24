from django.db import models
from hasta.models import Hasta, Family, ItemTitle
from doktor.models import Doktor, Visit
import json
from datetime import datetime


class SupportType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    kind = models.CharField(max_length=20, choices=[('hasta', 'Hasta'), ('family', 'Family')], default='hasta')
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
    family = models.ForeignKey(Family, on_delete=models.CASCADE, null=True, blank=True)
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

        if not self.family and self.visit:
            self.family = self.visit.family

        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Support'
        verbose_name_plural = 'Supports'

        unique_together = ['support_type', 'family', 'visit', 'frequency']


class SupportCriteria(models.Model):
    support_type = models.ForeignKey(SupportType, on_delete=models.CASCADE)
    title = models.TextField()
    income_items = models.ManyToManyField(ItemTitle, related_name='income_criteria', blank=True, limit_choices_to={'item_type': 'income'})
    expense_items = models.ManyToManyField(ItemTitle, related_name='expense_criteria', blank=True, limit_choices_to={'item_type': 'expense'})
    extra_info = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if isinstance(self.extra_info, str):
            self.extra_info = json.loads(self.extra_info)
        super().save(*args, **kwargs)
    
    def calculate_age_criteria(self):
        if self.support_type.kind == 'family' and 'age_criteria' in self.extra_info:
            age_criteria = self.extra_info['age_criteria']
            families = Support.objects.filter(support_type=self.support_type).values_list('family', flat=True)
            age_sum = 0
            for family in families:
                family_members = Hasta.objects.filter(family=family)
                for member in family_members:
                    # calculate age from member.date_of_birth in years
                    age = datetime.now().year - member.date_of_birth.year
                    if age < age_criteria['min']:
                        age_sum += age_criteria['min'] - age
                    elif age > age_criteria['max']:
                        age_sum += age - age_criteria['max']
                    else:
                        age_sum += 500
            return age_sum
        return 0

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