import random
from datetime import timedelta
from django.utils import timezone
from faker import Faker
from factory.django import DjangoModelFactory
from factory import LazyAttribute, SubFactory, SelfAttribute, PostGenerationMethodCall

fake = Faker()

class SupportTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'support.SupportType'

    name = LazyAttribute(lambda x: fake.word())
    description = LazyAttribute(lambda x: fake.text())

class SupportFactory(DjangoModelFactory):
    class Meta:
        model = 'support.Support'

    support_type = SubFactory(SupportTypeFactory)
    hasta = Hasta.objects.all()[random.randint(0, Hasta.objects.count() - 1)]
    family = hasta.family
    visit = Visit.objects.all()[random.randint(0, Visit.objects.count() - 1)]
    doktor = Doktor.objects.all()[random.randint(0, Doktor.objects.count() - 1)]
    status = LazyAttribute(lambda x: random.choice(['pending', 'completed', 'cancelled']))
    start_date = LazyAttribute(lambda x: timezone.now())
    end_date = LazyAttribute(lambda x: x.start_date + timedelta(days=random.randint(1, 30)))
    frequency = LazyAttribute(lambda x: random.choice(['once', 'daily', 'weekly', 'monthly', 'yearly']))
    additional_info = LazyAttribute(lambda x: fake.paragraph())

class SupportCriteriaFactory(DjangoModelFactory):
    class Meta:
        model = 'support.SupportCriteria'

    support = SubFactory(SupportFactory)
    criteria = LazyAttribute(lambda x: fake.text())

# class SupportApprovalFactory(DjangoModelFactory):
#     class Meta:
#         model = 'support.SupportApproval'

#     support = SubFactory(SupportFactory)
#     manager = SelfAttribute('support.doktor.manager')
#     approved = LazyAttribute(lambda x: fake.boolean())

# Example to generate data
if __name__ == '__main__':
    # Create 10 supports with related objects
    for _ in range(10):
        support = SupportFactory()
        SupportCriteriaFactory(support=support)
        # SupportApprovalFactory(support=support)
