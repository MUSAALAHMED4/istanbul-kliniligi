import json
from django.core.mail import send_mail
from django.conf import settings


def generate_genogram_payload(family):
    payload = []
    couple_ids = {}  # Dictionary to store couple IDs

    for hasta in family.hastalar.all():
        if hasta.partner_id:
            # Ensure both partners share the same CoupleID
            if hasta.national_id in couple_ids:
                couple_id = couple_ids[hasta.national_id]
            elif hasta.partner_id.national_id in couple_ids:
                couple_id = couple_ids[hasta.partner_id.national_id]
            else:
                couple_id = str(hasta.national_id)
                couple_ids[hasta.national_id] = couple_id
                couple_ids[hasta.partner_id.national_id] = couple_id
        else:
            couple_id = "-"

        # Prepare person dictionary
        person = {
            "FatherName": hasta.father.name if hasta.father else "-",
            "MotherName": hasta.mother.name if hasta.mother else "-",
            "PersonName": hasta.name,
            "DateofBirth": str(hasta.date_of_birth.year),
            "place": hasta.place_of_birth,
            "CoupleID": couple_id,
            "Gender": hasta.gender,
            "Maritalstatus": hasta.partner_relationship,
            "Lifestatus": hasta.status if hasta.status != "dead" else "deceased",
            "Caseofinterest": "No",
            "Livinginsamehouse": "Yes",
            "Healthstatus": "Good",
            "Disabilitystatus": "None",
            "ParentRelationshipType": hasta.partner_relationship_status or "None",
            "partner": hasta.partner_id.name if hasta.partner_id else "Still the partner name does not exist",
            "ChildrenType": "-",
            "twins": "-",
            "Otherinformation": "None"
        }
        payload.append(person)
    return payload


def send_genogram_report(family_id):
    from .models import Family
    family = Family.objects.get(id=family_id)
    family = Family.objects.get(id=family_id)
    payload = generate_genogram_payload(family)

    # send the payload to the email
    payload_str = json.dumps(payload, indent=4, ensure_ascii = False)
    email_message = f"""
    Hi,
    check this payload for the family with family_id: {family_id}
    {payload_str}
    """
    send_mail(
        'Genogram Report',
        email_message,
        'tech@tzuchiturkeydernek.org',
        [settings.TO_EMAIL],
        fail_silently=False,
    )