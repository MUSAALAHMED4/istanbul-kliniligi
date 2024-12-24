import requests
from django.db import models
from simple_history.models import HistoricalRecords
from django.conf import settings
from .helpers import generate_genogram_payload


class Family(models.Model):
    title = models.CharField(max_length=50)
    is_draft = models.BooleanField(default=True)

    @property
    def head_of_family(self):
        return self.hastalar.filter(is_head_of_family=True).first()

    @property
    def address(self):
        is_head = self.head_of_family
        if is_head:
            return is_head.address
        else:
            return self.hastalar.first().address

    def generate_genogram_tree(self):
        payload = generate_genogram_payload(self)
        headers = {
            "Content-Type": "application/json",
            "Request-Key": settings.GENOGRAM_API_KEY,
        }

        response = requests.post(settings.GENOGRAM_URL, json=payload, headers=headers)
        # save the returned image file to static folder
        if response.status_code == 200:
            with open(f"media/genogram/{self.id}.png", "wb") as f:
                f.write(response.content)

    @property
    def title_long(self):
        name = (
            f"{self.head_of_family} - {self.title}"
            if self.head_of_family
            else self.title
        )
        return name

    @property
    def expenses_summary(self):
        try:
            salaries = (
                self.hastalar.aggregate(models.Sum("salary"))["salary__sum"] or 0
            )
        except:
            salaries = 0

        try:
            other_incomes = (
                self.incomes.all().aggregate(models.Sum("amount"))["amount__sum"] or 0
            )
        except:
            other_incomes = 0

        total_income = salaries + other_incomes

        try:
            total_expenses = (
                self.expenses.all().aggregate(models.Sum("amount"))["amount__sum"] or 0
            )
        except:
            total_expenses = 0

        remaining = total_income - total_expenses

        bills = [
            "Water Bill",
            "Gas Bill",
            "Electricity Bill",
            "Internet Bill",
            "Other Bill",
        ]
        total_bills = (
            self.expenses.filter(title__item_name__in=bills).aggregate(
                models.Sum("amount")
            )["amount__sum"]
            or 0
        )

        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "remaining": remaining,
            "total_bills": total_bills,
            "total_salaries": salaries,
        }

    def __str__(self):
        return self.title


class Hasta(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    PARTNER_RELATIONSHIP = [
        ("single", "Single"),
        ("married", "Married"),
        ("divorced", "Divorced"),
        ("widow", "Widow"),
        ("engage", "Engage"),
        ("extra_marital", "Extra Marital"),
        ("separation", "Separation"),
    ]

    PARTNER_RELATIONSHIP_STATUS = [
        ("good", "Good"),
        ("tense", "Tense"),
        ("good-tense", "Good Tense"),
    ]

    STATUS = [
        ("alive", "Alive"),
        ("dead", "Dead"),
        ("lost", "Lost"),
    ]

    CONDITION_TYPE = [
        ("disability", "Disability"),
        ("illness", "Illness"),
    ]

    CONDITION_SEVERITY = [
        ("1", "1"),
        ("2", "2"),
        ("3", "3"),
    ]

    family = models.ForeignKey(
        "Family", related_name="hastalar", on_delete=models.SET_NULL, null=True
    )
    # Personel information
    first_name = models.CharField(max_length=50)
    first_name_tr = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    last_name_tr = models.CharField(max_length=50)
    place_of_birth = models.CharField(max_length=50, null=True, blank=True)
    place_of_birth_tr = models.CharField(max_length=50, null=True, blank=True)
    national_id_issue_place = models.CharField(max_length=255, blank=True, null=True)
    national_id = models.CharField(max_length=50, null=True, blank=True, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=50, choices=GENDER_CHOICES, null=True, blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="alive",
    )
    is_head_of_family = models.BooleanField(default=False)
    stay_with_family = models.BooleanField(default=True)

    # Family information

    father = models.ForeignKey(
        "self",
        related_name="father_children",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    mother = models.ForeignKey(
        "self",
        related_name="mother_children",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    partner_relationship = models.CharField(
        max_length=50, choices=PARTNER_RELATIONSHIP, null=True, blank=True
    )

    partner_relationship_status = models.CharField(
        max_length=50, choices=PARTNER_RELATIONSHIP_STATUS, null=True, blank=True
    )

    partner_id = models.ForeignKey(
        "self",
        related_name="partners",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    # Contact information

    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=50, null=True, blank=True)

    # Additional information

    profile_image = models.ImageField(
        upload_to="profile_images/", null=True, blank=True
    )
    has_condition = models.BooleanField(default=False)
    condition_type = models.CharField(
        max_length=200, choices=CONDITION_TYPE, null=True, blank=True
    )
    condition_severity = models.CharField(
        max_length=200, choices=CONDITION_SEVERITY, null=True, blank=True
    )
    condition_details = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    is_working = models.BooleanField(default=False)
    job_title = models.CharField(max_length=50, null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_draft = models.BooleanField(default=False)


    responsible_doktor_id = models.ForeignKey(
        "doktor.doktor",
        related_name="hastalar",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    last_updated_by_visit = models.ForeignKey(
        "doktor.Visit",
        related_name="updated_hatalar",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    additional_info = models.JSONField(null=True, blank=True)

    # --------------------------------------------------------------------------------------------------------------------------------------------------

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def family_mobile_number(self):
        try:
            head = self.family.hastalar.filter(is_head_of_family=True).first()
            if head:
                return head.mobile_number
        except:
            return None

    def save(self, *args, **kwargs):
        # Capture the visit information from the kwargs
        visit = kwargs.pop("visit", None)

        if not self.family:
            family = Family.objects.create(title=self.last_name)
            self.family = family

        try:
            family = self.family
            if not family.hastalar.exists():
                family.title = self.last_name
                family.save()
        except Exception as e:
            raise e

        if self.status in ["dead", "lost"]:
            if self.is_head_of_family:
                raise ValueError("Head of family cannot be dead or lost")
            # get max national_id and increment by 1
            max_id = Hasta.objects.all().aggregate(models.Max("id"))["id__max"]
            self.national_id = f"{self.family.id}{max_id + 1}000"
            self.mobile_number = self.family_mobile_number
            self.address = self.family.address

        try:
            super().save(*args, **kwargs)
        except Exception as e:
            raise e

        # check if partner is set and update the partner's partner_id avoid recursion
        if self.partner_id and not self.partner_id.partner_id:
            self.partner_id.partner_id = self
            self.partner_id.partner_relationship_status = (
                self.partner_relationship_status
            )
            self.partner_id.partner_relationship = self.partner_relationship
            self.partner_id.save()

        if self.is_head_of_family:
            self.family.hastalar.exclude(id=self.id).update(is_head_of_family=False)

        # Create a historical record with the visit information
        self.history.all().first().visit = visit
        self.history.all().first().save()

        # generate genogram tree
        if self.family:
            self.family.generate_genogram_tree()

        if self.family.hastalar.filter(is_draft=True).count() == 0:
            self.family.is_draft = False
            self.family.save()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class HistoricalHasta(models.Model):
    visit = models.ForeignKey(
        "doktor.Visit", on_delete=models.SET_NULL, null=True, blank=True
    )
    history = HistoricalRecords()

    class Meta:
        abstract = True


class ItemTitle(models.Model):
    ITEM_TYPES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    item_name = models.CharField(max_length=100)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES)

    def __str__(self):
        return f"{self.item_name} ({self.item_type})"


class Income(models.Model):
    hasta = models.ForeignKey(
        "Hasta",
        related_name="incomes",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    family = models.ForeignKey(
        "Family",
        related_name="incomes",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    title = models.ForeignKey(
        ItemTitle,
        related_name="income_titles",
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={"item_type": "income"},
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    additional_info = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"


class Expense(models.Model):
    hasta = models.ForeignKey(
        "Hasta",
        related_name="expenses",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    family = models.ForeignKey(
        "Family",
        related_name="expenses",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    title = models.ForeignKey(
        ItemTitle,
        related_name="expense_titles",
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={"item_type": "expense"},
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    additional_info = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"


class City(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class District(models.Model):
    city = models.ForeignKey("City", related_name="districts", on_delete=models.CASCADE)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Neighborhood(models.Model):
    district = models.ForeignKey(
        "District", related_name="neighborhoods", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
