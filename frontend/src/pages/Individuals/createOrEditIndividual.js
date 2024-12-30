import React, { useEffect, useState, useRef } from "react";
import instance from "base_url";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { validateRequiredFields, setErrorFn } from "../Utility/Functions";

//flatpickr
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import CalendarTranslations from "components/Common/CalendarTranslations";

// import style.css from current directory
import "./style.css";

const defaultIndividual = {
  first_name: "",
  last_name: "",
  national_id: "",
  date_of_birth: "",
  place_of_birth: "",
  gender: "",
  mobile_number: "",
  email: "",
  address: "",
  family: null,
  mother: null,
  father: null,
  notes: "",
  clinic_name: "",
  doctor: "",
  appointment_time: "",
  reason_for_appointment: "",
};

const fields_tabs_mapping = {
  1: [
    "first_name",
    "last_name",
    "date_of_birth",
    "place_of_birth",
    "gender",
    "national_id",
  ],
  2: ["clinic_name", "doctor", "appointment_time"],
  3: ["mobile_number", "email"],
  4: [],
};

function CreateOrEditIndividual({ t, i18n }) {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    description: "",
    type: "",
  });
  const [activeTab, setActiveTab] = useState(1);
  const calendarTranslations = CalendarTranslations();
  const [individual, setIndividual] = useState(defaultIndividual);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const familyId = searchParams.get("family");
  const [newIndFamilyId, setNewIndFamilyId] = useState(null);
  const [dataSaved, setDataSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [error, setError] = useState(null);
  const [errorFields, setErrorFields] = useState([]);

  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";

  // Email
  const [emailPrefix, setEmailPrefix] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const emailDomains = ["@gmail.com", "@yahoo.com", "@hotmail.com"];

  const handleEmailPrefixChange = (e) => {
    setEmailPrefix(e.target.value);
    updateServerParams(`${e.target.value}${emailDomain}`, "email");
  };

  const handleEmailDomainChange = (e) => {
    setEmailDomain(e.target.value);
    updateServerParams(`${emailPrefix}${e.target.value}`, "email");
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // get visit id from query params (if the page is visited from a visits page)
  const visitId =
    new URLSearchParams(window.location.search).get("visit") ||
    individual?.last_updated_by_visit;

  const updateServerParams = (value, param) => {
    // check type of value if boolean or not
    if (typeof value === "boolean") {
      setIndividual((prevIndividual) => ({
        ...prevIndividual,
        [param]: value,
      }));
    } else {
      setIndividual((prevIndividual) => ({
        ...prevIndividual,
        [param]: value ? value : null,
      }));
    }
  };

  const saveIndividual = async () => {
    setIsFormSubmitted(true); // إظهار الحقول المطلوبة
    setIsSaving(true); // تعطيل الزر مؤقتًا أثناء الحفظ

    // التحقق من الحقول المطلوبة
    const requiredFields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "place_of_birth",
      "gender",
      "clinic_name",
      "doctor",
      "appointment_time",
      "appointment_date",
    ];

    const allRequiredFields = [
      ...requiredFields,
      "national_id",
      "mobile_number",
    ];

    const errorFields = allRequiredFields.filter(
      (field) => !individual[field] || individual[field] === ""
    );

    setErrorFields(errorFields);

    if (errorFields.length > 0) {
      setAlert({
        show: true,
        message: "Error",
        description: "Some fields are missing!",
        type: "error",
      });
      setIsSaving(false);
      return;
    }

    const payload = {
      ...individual,
      family: familyId,
      last_updated_by_visit: visitId,
    };

    try {
      if (id && id !== "new") {
        await instance.put(`/individuals/${id}/`, payload);
      } else {
        const newIndividualResponse = await instance.post(
          "/individuals/",
          payload
        );
        const familyId = newIndividualResponse.data.family;
        setNewIndFamilyId(familyId);
      }

      setDataSaved(true);
      setShowModal(true); // عرض النافذة المنبثقة عند نجاح الحفظ
    } catch (e) {
      console.error("Error saving individual:", e);
      setErrorFn(e, setErrorOccurred, setError);
    } finally {
      setIsSaving(false); // إعادة تمكين الزر بعد الحفظ
    }
  };

  const handleNavigateToFamilyDetails = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleAddNewIndividual = () => {
    setShowModal(false);
    navigate(
      `/individual/new?family=${newIndFamilyId}${
        visitId ? `&visit=${visitId}` : ""
      }`,
      { replace: true }
    );

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleStringInput = (e, param) => {
    const value = e.target.value;
    // Use regex to allow only letters and spaces
    const regex = /^[^\d\u0660-\u0669\u06F0-\u06F9]*$/;

    if (regex.test(value)) {
      updateServerParams(value, param);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        {errorOccurred && (
          <div
            className="alert alert-danger fade show"
            role="alert"
            style={{
              position: "fixed!important",
              bottom: "0",
              right: "0",
              top: "auto",
            }}
          >
            {error}
          </div>
        )}
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              
            </Row>
            <div
              className="form-wizard-wrapper wizard clearfix"
              dir={rtlDirection}
            >
              <div className="steps clearfix">
                <ul>
                  {rtlDirection === "rtl" ? (
                    <>
                      <NavItem className={activeTab === 4 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(4)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            4.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Additional Details")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            3.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Contact Information")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 2 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(2)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            2.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Clinic information ")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 1 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(1)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            1.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Personal Information")}
                          </span>
                        </NavLink>
                      </NavItem>
                    </>
                  ) : (
                    <>
                      <NavItem className={activeTab === 1 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(1)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            1.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[1].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Personal Information")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 2 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(2)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            2.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[2].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Clinic information ")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            3.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Contact Information")}
                          </span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 4 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(4)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            4.
                          </span>
                          <span
                            style={{
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[4].includes(x)
                              )
                                ? "red"
                                : "inherit",
                            }}
                          >
                            {t("Additional Details")}
                          </span>
                        </NavLink>
                      </NavItem>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <TabContent activeTab={activeTab} className="body">
                    <TabPane tabId={1}>
                      {/* First and Last Name */}
                      <div className="row mb-4">
                        {/* First Name */}
                        <div className="col-2 align-content-center">
                          <p>
                            {t("First")} <span style={{ color: "red" }}>*</span>{" "}
                            / {t("Last Name")}{" "}
                            <span style={{ color: "red" }}>*</span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add First Name")}
                            value={individual.first_name}
                            onChange={(e) => handleStringInput(e, "first_name")}
                            style={{
                              border: errorFields.find(
                                (x) => x === "first_name"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>

                        {/* Last Name */}
                        <div className="col-4">
                          <input
                            className="form-control required"
                            placeholder={t("Add Last Name")}
                            value={individual.last_name}
                            onChange={(e) => handleStringInput(e, "last_name")}
                            style={{
                              border: errorFields.find((x) => x === "last_name")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      {/* Place of birth */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Place birth / National Id")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add Place of birth")}
                            value={individual.place_of_birth}
                            onChange={(e) =>
                              handleStringInput(e, "place_of_birth")
                            }
                            style={{
                              border: errorFields.find(
                                (x) => x === "place_of_birth"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control draftNotRequired"
                            placeholder={t("Add National Id")}
                            type="number"
                            inputMode="numeric"
                            pattern="\d*"
                            min="0"
                            value={individual.national_id}
                            onChange={(e) => {
                              updateServerParams(e.target.value, "national_id");
                            }}
                            style={{
                              border: errorFields.find(
                                (x) => x === "national_id"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      {/* Date of birth */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p>
                            {t("Date birth")}{" "}
                            <span style={{ color: "red" }}>*</span> /{" "}
                            {t("Gender")}{" "}
                            <span style={{ color: "red" }}>*</span>
                          </p>
                        </div>
                        <div className="col-4">
                          <Flatpickr
                            className="form-control d-block"
                            placeholder={t("Add Date of birth")}
                            options={{
                              mode: "single",
                              dateFormat: "Y-m-d",
                              defaultDate: individual.date_of_birth
                                ? moment(individual.date_of_birth).format(
                                    "YYYY-MM-DD"
                                  )
                                : null,
                              locale: {
                                weekdays: {
                                  shorthand: calendarTranslations.shortDays,
                                  longhand: calendarTranslations.longhand,
                                },
                                months: {
                                  shorthand: calendarTranslations.months,
                                  longhand: calendarTranslations.months,
                                },
                              },
                            }}
                            onChange={(selectedDates, dateStr, instance) => {
                              updateServerParams(dateStr, "date_of_birth");
                            }}
                            style={{
                              border: errorFields.find(
                                (x) => x === "date_of_birth"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                        {/*  Gender */}
                        <div className="col-4">
                          <select
                            className={`form-control form-select ${
                              isFormSubmitted && !individual.gender
                                ? "is-invalid"
                                : ""
                            }`}
                            value={individual.gender}
                            onChange={(e) => {
                              updateServerParams(e.target.value, "gender");
                            }}
                            style={{
                              border: errorFields.find((x) => x === "gender")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option>{t("Select a gender")}</option>
                            <option value="male">{t("Male")}</option>
                            <option value="female">{t("Female")}</option>
                            <option value="other">{t("Other")}</option>
                          </select>
                        </div>
                      </div>
                      <div className="row mb-4">
                        {/* Father */}
                        <div className="col-2 align-content-center">
                          <p>
                            {t("Father")}/{t("Mother")}
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            type="text"
                            className={`form-control ${
                              isFormSubmitted && errorFields.includes("father")
                                ? "is-invalid"
                                : ""
                            }`}
                            name="Father"
                            placeholder={
                              individual?.father_name ||
                              t("Enter father's name")
                            }
                            value={individual?.father_name || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value) {
                                updateServerParams(null, "father");
                                updateServerParams(null, "father_name");
                                updateServerParams(null, "father_partner_id"); // Reset partner_id
                              } else {
                                updateServerParams(value, "father_name");
                              }
                            }}
                          />
                        </div>
                        {/* Mother */}
                        <div className="col-4">
                          <input
                            type="text"
                            className={`form-control ${
                              isFormSubmitted && errorFields.includes("mother")
                                ? "is-invalid"
                                : ""
                            }`}
                            name="Mother"
                            placeholder={
                              individual?.mother_name ||
                              t("Enter mother's name")
                            }
                            value={individual?.mother_name || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value) {
                                updateServerParams(null, "mother");
                                updateServerParams(null, "mother_name");
                                updateServerParams(null, "mother_partner_id"); // Reset partner_id
                              } else {
                                updateServerParams(value, "mother_name");
                              }
                            }}
                          />
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId={2}>
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Clinic Name")}</strong>
                            <span style={{ color: "red" }}> *</span>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className={`form-control form-select ${
                              isFormSubmitted && !individual.clinic_name
                                ? "is-invalid"
                                : ""
                            }`}
                            value={individual.clinic_name}
                            onChange={(e) =>
                              updateServerParams(e.target.value, "clinic_name")
                            }
                            style={{
                              border: errorFields.includes("clinic_name")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">{t("Select a Specialty")}</option>
                            <option value="Endocrinology and Diabetes">
                              {t("Endocrinology and Diabetes")}
                            </option>
                            <option value="Cardiology">
                              {t("Cardiology")}
                            </option>
                            <option value="Gynecology">
                              {t("Gynecology")}
                            </option>
                            <option value="Pediatrics">
                              {t("Pediatrics")}
                            </option>
                            <option value="Orthopedics">
                              {t("Orthopedics")}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Doctor")}</strong>
                            <span style={{ color: "red" }}> *</span>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className={`form-control form-select ${
                              isFormSubmitted && !individual.doctor
                                ? "is-invalid"
                                : ""
                            }`}
                            value={individual.doctor}
                            onChange={(e) =>
                              updateServerParams(e.target.value, "doctor")
                            }
                            style={{
                              border: errorFields.includes("doctor")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">{t("Select a Doctor")}</option>
                            <option value="Anas Daas">{t("Anas Daas")}</option>
                            <option value="Lond Fares">
                              {t("Lond Fares")}
                            </option>
                            <option value="Mousa Alahmad">
                              {t("Mousa Alahmad")}
                            </option>
                            <option value="Jomaa Alali">
                              {t("Jomaa Alali")}
                            </option>
                            <option value="Qahraman Mohammed">
                              {t("kahraman Mohammed")}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Appointment Date")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <Flatpickr
                            className="form-control d-block"
                            placeholder={t("Add Date of Appointment")}
                            options={{
                              mode: "single",
                              dateFormat: "Y-m-d",
                              defaultDate: individual.date_of_birth
                                ? moment(individual.date_of_birth).format(
                                    "YYYY-MM-DD"
                                  )
                                : null,
                              locale: {
                                weekdays: {
                                  shorthand: calendarTranslations.shortDays,
                                  longhand: calendarTranslations.longhand,
                                },
                                months: {
                                  shorthand: calendarTranslations.months,
                                  longhand: calendarTranslations.months,
                                },
                              },
                            }}
                            onChange={(selectedDates, dateStr, instance) => {
                              updateServerParams(dateStr, "appointment_date");
                            }}
                            style={{
                              border: errorFields.find(
                                (x) => x === "appointment_date"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Appointment Time")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            type="time"
                            value={individual.appointment_time || ""}
                            onChange={(e) =>
                              updateServerParams(
                                e.target.value,
                                "appointment_time"
                              )
                            }
                            style={{
                              border: errorFields.includes("appointment_time")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Reason for Appointment")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder={t("Enter Reason for Appointment")}
                            value={individual.reason_for_appointment || ""}
                            onChange={(e) =>
                              updateServerParams(
                                e.target.value,
                                "reason_for_appointment"
                              )
                            }
                            style={{
                              border: errorFields.includes(
                                "reason_for_appointment"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          ></textarea>
                        </div>
                      </div>
                    </TabPane>

                    <TabPane tabId={3}>
                      {/* Mobile Number */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Mobile Number")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add mobile number")}
                            type="number"
                            inputMode="numeric"
                            pattern="\d*"
                            min="0"
                            maxLength={11}
                            value={individual.mobile_number || ""}
                            onChange={(e) => {
                              if (e.target.value.length <= 11) {
                                updateServerParams(
                                  e.target.value,
                                  "mobile_number"
                                );
                              }
                            }}
                            style={{
                              border: errorFields.includes("mobile_number")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      {/* E-mail Prefix and Domain */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("E-mail")}</strong>
                          </p>
                        </div>
                        <div className="col-4 d-flex">
                          <input
                            className="form-control me-2"
                            type="text"
                            placeholder={t("Enter email prefix")}
                            value={emailPrefix}
                            onChange={(e) => {
                              const prefix = e.target.value;
                              setEmailPrefix(prefix);
                              updateServerParams(
                                `${prefix}${emailDomain}`,
                                "email"
                              );
                            }}
                            style={{ width: "50%" }}
                          />
                          <select
                            className="form-select"
                            value={emailDomain}
                            onChange={(e) => {
                              const domain = e.target.value;
                              setEmailDomain(domain);
                              updateServerParams(
                                `${emailPrefix}${domain}`,
                                "email"
                              );
                            }}
                            style={{ width: "50%" }}
                          >
                            <option value="">
                              {t("Select email provider")}
                            </option>
                            {emailDomains.map((domain) => (
                              <option key={domain} value={domain}>
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Full E-mail */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Full E-mail")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            type="text"
                            value={
                              individual.email || `${emailPrefix}${emailDomain}`
                            }
                            readOnly
                          />
                        </div>
                      </div>
                      {/* Address Field */}
                      <div className="row mb-4 form-address">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Address")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Enter address")}
                            value={individual.address}
                            onChange={(e) =>
                              updateServerParams(e.target.value, "address")
                            }
                          />
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId={4}>
                      {/* Insurance Type */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Insurance Type")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control"
                            value={individual.insurance_type || ""}
                            onChange={(e) =>
                              updateServerParams(
                                e.target.value,
                                "insurance_type"
                              )
                            }
                            style={{
                              border: errorFields.includes("insurance_type")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">
                              {t("Select Insurance Type")}
                            </option>
                            <option value="private">
                              {t("Private Insurance")}
                            </option>
                            <option value="public">
                              {t("Public Insurance")}
                            </option>
                            <option value="none">{t("No Insurance")}</option>
                          </select>
                        </div>
                      </div>

                      {/* Medical File Number */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Medical File Number")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Enter Medical File Number")}
                            value={individual.medical_file_number || ""}
                            onChange={(e) =>
                              updateServerParams(
                                e.target.value,
                                "medical_file_number"
                              )
                            }
                            style={{
                              border: errorFields.includes(
                                "medical_file_number"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                      </div>

                      {/* Appointment Duration */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Appointment Duration")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control"
                            value={individual.appointment_duration || ""}
                            onChange={(e) =>
                              updateServerParams(
                                e.target.value,
                                "appointment_duration"
                              )
                            }
                            style={{
                              border: errorFields.includes(
                                "appointment_duration"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">{t("Select Duration")}</option>
                            <option value="15">{t("15 Minutes")}</option>
                            <option value="30">{t("30 Minutes")}</option>
                            <option value="60">{t("1 Hour")}</option>
                          </select>
                        </div>
                      </div>

                      {/* Emergency Appointment */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>
                              {t("Is this an emergency appointment?")}
                            </strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              checked={individual.is_emergency || false}
                              type="checkbox"
                              onChange={(e) =>
                                updateServerParams(
                                  e.target.checked,
                                  "is_emergency"
                                )
                              }
                              style={{
                                border: errorFields.includes("is_emergency")
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* Actions */}
          <div className="actions clearfix">
            <div
              className="button-group"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <div>
                <Button
                  className={activeTab === 1 ? "previous disabled" : "previous"}
                  onClick={() => toggleTab(activeTab - 1)}
                >
                  {t("Previous")}
                </Button>
              </div>
              <div>
                <Button
                  className={activeTab === 4 ? "next disabled" : "next"}
                  onClick={() => toggleTab(activeTab + 1)}
                >
                  {t("Next")}
                </Button>
              </div>
              {/* Save button */}
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSaving}
                  onClick={() => {
                    saveIndividual();
                  }}
                >
                  {t("Save")}
                </button>
              </div>
              {showModal && (
                <div
                  className="modal bs-example-modal"
                  tabIndex="-1"
                  onClick={(e) => {
                    if (e.target.className === "modal bs-example-modal") {
                      setShowModal(false);
                    }
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1050,
                  }}
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {t("Save Confirmation")}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p style={{ textAlign: "center" }}>
                          <span>
                            {t("The Create has been saved successfully!")}
                          </span>
                          <span style={{ display: "block", marginTop: "10px" }}>
                            {t("Where would you like to go next?")}
                          </span>
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleNavigateToFamilyDetails}
                        >
                          {t("Save and exit")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleAddNewIndividual}
                        >
                          {t("Modify Current Request")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default withTranslation()(CreateOrEditIndividual);
