# factories.py
import factory
from faker import Faker
from django.contrib.auth.models import User
from hasta.models import Family, Hasta
from volunteer.models import Volunteer, VisitRequester, Visit
from support.models import SupportType, Support, SupportCriteria, SupportApproval
import random

fake = Faker()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.LazyAttribute(lambda _: fake.user_name())
    email = factory.LazyAttribute(lambda _: fake.email())
    password = factory.PostGenerationMethodCall('set_password', 'password')

class FamilyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Family

    title = factory.LazyAttribute(lambda _: fake.last_name())

class HastaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Hasta

    family = factory.SubFactory(FamilyFactory)
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    date_of_birth = factory.LazyAttribute(lambda _: fake.date_of_birth())
    place_of_birth = factory.LazyAttribute(lambda _: fake.city())
    national_id = factory.LazyAttribute(lambda _: fake.ssn())
    gender = factory.LazyAttribute(lambda _: fake.random_element(['male', 'female', 'other']))
    mobile_number = factory.LazyAttribute(lambda _: fake.phone_number())
    address = factory.LazyAttribute(lambda _: fake.address())
    location = factory.LazyAttribute(lambda _: fake.city())
    is_head_of_family = factory.LazyAttribute(lambda _: fake.boolean())

class VolunteerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Volunteer

    hasta = Hasta.objects.all()[random.randint(0, Hasta.objects.count() - 1)]

class VisitRequesterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VisitRequester

    name = factory.LazyAttribute(lambda _: fake.name())
    organization = factory.LazyAttribute(lambda _: fake.company())
    phone = factory.LazyAttribute(lambda _: fake.phone_number())
    email = factory.LazyAttribute(lambda _: fake.email())
    address = factory.LazyAttribute(lambda _: fake.address())

class VisitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Visit

    volunteer = factory.SubFactory(VolunteerFactory)
    family = factory.SubFactory(FamilyFactory)
    hasta = factory.SubFactory(HastaFactory)
    visit_requester = factory.SubFactory(UserFactory)
    visit_responsible = factory.SubFactory(VolunteerFactory)
    visit_purpose = factory.LazyAttribute(lambda _: fake.text())
    visit_status = factory.LazyAttribute(lambda _: fake.random_element(['requested', 'pending', 'completed', 'draft', 'cancelled']))

class SupportTypeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SupportType

    name = factory.LazyAttribute(lambda _: fake.word())
    description = factory.LazyAttribute(lambda _: fake.text())
    kind = factory.LazyAttribute(lambda _: fake.random_element(['hasta', 'family']))

class SupportFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Support

    support_type = factory.SubFactory(SupportTypeFactory)
    hasta = factory.SubFactory(HastaFactory)
    family = factory.SubFactory(FamilyFactory)
    visit = factory.SubFactory(VisitFactory)
    volunteer = factory.SubFactory(VolunteerFactory)
    status = factory.LazyAttribute(lambda _: fake.random_element(['pending', 'approved', 'rejected']))

class SupportCriteriaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SupportCriteria

    support = factory.SubFactory(SupportFactory)
    criteria = factory.LazyAttribute(lambda _: fake.text())

class SupportApprovalFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SupportApproval

    support = factory.SubFactory(SupportFactory)
    manager = factory.SubFactory(VolunteerFactory)
    status = factory.LazyAttribute(lambda _: fake.random_element(['waiting', 'approved', 'rejected']))

# generate_test_data.py
import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tijuana.settings")
django.setup()

from factories import (
    UserFactory, FamilyFactory, hastaFactory, VolunteerFactory,
    VisitRequesterFactory, VisitFactory, SupportTypeFactory, SupportFactory,
    SupportCriteriaFactory, SupportApprovalFactory
)

def generate_test_data():
    # users = UserFactory.create_batch(10)
    # families = FamilyFactory.create_batch(5)
    volunteers = VolunteerFactory.create_batch(5)
    visit_requesters = VisitRequesterFactory.create_batch(10)
    visits = VisitFactory.create_batch(10)
    support_types = SupportTypeFactory.create_batch(5)
    supports = SupportFactory.create_batch(10)
    support_criterias = SupportCriteriaFactory.create_batch(10)
    support_approvals = SupportApprovalFactory.create_batch(10)

if __name__ == "__main__":
    generate_test_data()
