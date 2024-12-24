import os
import django
from faker import Faker
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tijuana.settings')
django.setup()

from hasta.models import hasta, Family
from doktor.models import Doktor, VisitRequester, Visit  

fake = Faker()

def create_doktors(n):
    hastalar = list(Hasta.objects.all())
    for _ in range(n):
        hasta = random.choice(hastalar)
        position = fake.job()
        Doktor.objects.create(
            hasta=hasta,
            manager=None,  # Assuming some doktors might not have managers
            position=position,
            extra_info=fake.text()
        )

def create_visit_requesters(n):
    for _ in range(n):
        name = fake.company()
        VisitRequester.objects.create(
            name=name,
            organization=name,
            phone=fake.phone_number(),
            email=fake.email(),
            address=fake.address()
        )

def create_visits(n):
    doktors = list(Doktor.objects.all())
    families = list(Family.objects.all())
    hastalar = list(Hasta.objects.all())
    requesters = list(VisitRequester.objects.all())

    for _ in range(n):
        visit = Visit(
            doktor=random.choice(doktors),
            family=random.choice(families),
            hasta=random.choice(hastalar),
            visit_date=fake.date_time_this_year(),
            visit_requester=random.choice(requesters),
            visit_purpose=fake.sentence(),
            visit_notes=fake.text(),
            visit_status=random.choice(['pending', 'completed', 'cancelled']),
            duration=random.randint(30, 120),
            extra_info=fake.text()
        )
        visit.save()


create_doktors(10)
create_visit_requesters(5)
create_visits(20)

print("Dummy data generated successfully!")
