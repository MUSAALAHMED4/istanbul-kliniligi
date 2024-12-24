import pandas as pd
from django.contrib.auth.models import User
from hasta.models import Family, Hasta
from doktor.models import Doktor, Visit

national_id = 123456


hastalar = pd.read_excel("families.xlsx", sheet_name="hastalar")
visits = pd.read_excel("families.xlsx", sheet_name="visits")
families = pd.read_excel("families.xlsx", sheet_name="families")

families_objs = []
hastalar_objs = []
visits_objs = []
doktor_objs = []
hastalar_errors = []


for index, family in families.iterrows():
    print("====================================================================================================")
    family_hastalar = hastalar[hastalar.family_id == family.id]
    family_hastalar.salary.fillna(0, inplace=True)
    visit = visits[visits.id == family.id].iloc[0]
    
    last_name = family_hastalar[family_hastalar.relationship_type == 'رب الأسرة'].iloc[0].last_name
    print("start processing family", last_name)


    family_exists = Family.objects.filter(id=family.id)
    if not family_exists:
        family_obj = Family(title=last_name, id=family.id)
        family_obj.save()
        families_objs.append(family_obj)
    else:
        family_obj = family_exists.first()

    try:
        doktor_first_name, doktor_last_name = visit.doktor_name.split()
    except ValueError as e:
        doktor_first_name = doktor_last_name = visit.doktor_name
    
    vol_exists = Doktor.objects.filter(hasta__first_name=doktor_first_name, hasta__last_name=doktor_last_name)

    if not vol_exists:
        vol_ind_exists = Hasta.objects.filter(first_name=doktor_first_name, last_name=doktor_last_name, national_id=str(national_id))
        if not vol_ind_exists:
            vol_ind = Hasta(last_name=doktor_last_name, first_name=doktor_first_name, last_name_tr = doktor_last_name, first_name_tr=doktor_first_name, national_id_issue_place="test", national_id=str(national_id), date_of_birth="2020-01-01", place_of_birth="test", place_of_birth_tr="test", job_title="test", salary=1000, gender="male", mobile_number="1111111", address="test", is_draft=True, status='alive')
            vol_ind.save()
        else:
            vol_ind = vol_ind_exists.first()
        
        national_id += 1
        doktor_obj = Doktor(hasta=vol_ind, position="test")
        doktor_obj.save()
        doktor_objs.append(doktor_obj)
    else:
        doktor_obj = vol_exists.first()


    user = User.objects.first()

    visit['visit_date'] = "2020-01-01"
    visit_exists = Visit.objects.filter(visit_requester=user, family=family_obj, doktor=doktor_obj)
    if not visit_exists:
        visit_obj = Visit(
            doktor=doktor_obj,
            family=family_obj,
            visit_date=visit.visit_date,
            visit_requester=user,
            visit_purpose="تحديث بيانات",
            visit_notes=visit.notes,
            doktor_notes=visit.doktor_notes,
            visit_status="completed"
        )
        visit_obj.save()
        visits_objs.append(visit_obj)
    else:
        visit_obj = visit_exists.first()

    for index, hasta in family_hastalar.iterrows():
        print("saving hastalar for family", family_obj.title)
        print(index, hasta.first_name, hasta.last_name, hasta.national_id, family.id)
        exists = Hasta.objects.filter(national_id=hasta.national_id).exists()
        if not exists:
            hasta_obj = Hasta(
                last_name=hasta.last_name, 
                first_name=hasta.first_name, 
                last_name_tr = hasta.last_name_tr, 
                first_name_tr=hasta.first_name_tr, 
                national_id_issue_place=hasta.national_id_issuer, 
                national_id=hasta.national_id, 
                date_of_birth=f"{hasta.date_of_birth}-01-01" if hasta.date_of_birth and hasta.date_of_birth != 0 else '1900-01-01', 
                place_of_birth=hasta.place_of_birth, 
                place_of_birth_tr=hasta.place_of_birth, 
                job_title=hasta.job_title, 
                salary=hasta.salary, 
                gender=hasta.gender, 
                mobile_number=family.mobile, 
                address=family.address, 
                is_draft=True,
                family=family_obj,
                last_updated_by_visit=visit_obj
            )
            try:
                hasta_obj.save()
                hastalar_objs.append(hasta_obj)
            except Exception as e:
                hastalar_errors.append((hasta, e))