# Generated by Django 5.0.4 on 2024-12-30 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hasta', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hasta',
            name='appointment_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='appointment_duration',
            field=models.CharField(blank=True, choices=[('15', '15 Minutes'), ('30', '30 Minutes'), ('60', '1 Hour')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='appointment_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='clinic_name',
            field=models.CharField(blank=True, choices=[('Endocrinology_and_Diabetes', 'Endocrinology and Diabetes'), ('Cardiology', 'Cardiology'), ('Gynecology', 'Gynecology'), ('Pediatrics', 'Pediatrics'), ('Orthopedics', 'Orthopedics')], max_length=50),
        ),
        migrations.AddField(
            model_name='hasta',
            name='insurance_type',
            field=models.CharField(blank=True, choices=[('private', 'Private'), ('public', 'Public'), ('none', 'None')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='is_emergency',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='medical_file_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='national_id',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='hasta',
            name='place_of_birth',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='hasta',
            name='reason_for_appointment',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='appointment_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='appointment_duration',
            field=models.CharField(blank=True, choices=[('15', '15 Minutes'), ('30', '30 Minutes'), ('60', '1 Hour')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='appointment_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='clinic_name',
            field=models.CharField(blank=True, choices=[('Endocrinology_and_Diabetes', 'Endocrinology and Diabetes'), ('Cardiology', 'Cardiology'), ('Gynecology', 'Gynecology'), ('Pediatrics', 'Pediatrics'), ('Orthopedics', 'Orthopedics')], max_length=50),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='insurance_type',
            field=models.CharField(blank=True, choices=[('private', 'Private'), ('public', 'Public'), ('none', 'None')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='is_emergency',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='medical_file_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='national_id',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='place_of_birth',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='historicalhasta',
            name='reason_for_appointment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
