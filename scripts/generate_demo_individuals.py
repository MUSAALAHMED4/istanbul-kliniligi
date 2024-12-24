import random
from datetime import timedelta, date
from django.utils.timezone import now
from hasta.models import Family, Hasta

def create_family():
    head_mobile_number = f'+{random.randint(1000000000, 9999999999)}'
    head_email = f"{head_mobile_number}@example.com"
    head_address = f"{random.randint(100, 999)} Example Street, Example City"
    head_location = "Example Location"
    responsible_doktor_id = random.randint(1, 10)
    additional_info = "Some additional info"

    family = Family(
        head_mobile_number=head_mobile_number,
        head_email=head_email,
        head_address=head_address,
        head_location=head_location,
        responsible_doktor_id=responsible_doktor_id,
        additional_info=additional_info,
    )
    family.save()
    return family

def create_hasta(family):
    first_name = random.choice(['John', 'Jane', 'Alice', 'Bob', 'Charlie'])
    last_name = random.choice(['Smith', 'Doe', 'Johnson', 'Williams', 'Brown'])
    mother_name = "Mother " + last_name
    father_name = "Father " + last_name
    date_of_birth = now().date() - timedelta(days=random.randint(7000, 20000))
    place_of_birth = "Example City"
    national_id = str(random.randint(100000000, 999999999))
    job_title = random.choice(['Engineer', 'Doctor', 'Teacher', 'Artist', 'Musician'])
    salary = random.uniform(1000.0, 5000.0)
    partner_relation_type = random.choice(['Spouse', 'Friend'])
    partner_relation_status = random.choice(['Married', 'Single'])
    has_family = random.choice([True, False])
    mobile_number = f'+{random.randint(1000000000, 9999999999)}'
    email = f"{first_name.lower()}.{last_name.lower()}@example.com"
    address = "Some address"
    location = "Some location"
    responsible_doktor_id = random.randint(1, 10)
    notes = "Some notes"
    additional_info = {"info": "Some JSON data"}
    is_head_of_family = False

    hasta = Hasta(
        family=family,
        first_name=first_name,
        last_name=last_name,
        mother_name=mother_name,
        father_name=father_name,
        date_of_birth=date_of_birth,
        place_of_birth=place_of_birth,
        national_id=national_id,
        job_title=job_title,
        salary=salary,
        partner_relation_type=partner_relation_type,
        partner_relation_status=partner_relation_status,
        has_family=has_family,
        mobile_number=mobile_number,
        email=email,
        address=address,
        location=location,
        created_at=now(),
        updated_at=now(),
        responsible_doktor_id=responsible_doktor_id,
        notes=notes,
        additional_info=additional_info,
        is_head_of_family=is_head_of_family
    )
    hasta.save()
    return hasta

def generate_records(num_records):
    for _ in range(num_records):
        family = create_family()
        create_hasta(family)

# Generate 100 records
generate_records(100)
