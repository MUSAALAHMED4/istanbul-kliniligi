import React, { useEffect, useState, useRef } from "react";
import instance from "base_url";
import Autocomplete from "components/Common/Autocomplete";
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
import MapAddress from "components/Common/MapAddress";
import { validateRequiredFields, setErrorFn } from "../Utility/Functions";
import Alert from "components/Common/Alert";
import Webcam from "react-webcam";

import { getSehirData, getIlceData, getMahalleData } from "helpers/address";

//flatpickr
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import CalendarTranslations from "components/Common/CalendarTranslations";

// import json data
// import sehirData from "common/data/sehir.json";
// import sehir from "common/json/sehir.json";
// import ilceData from "common/json/ilce.json";
// import mahalleData from "common/json/mahalle.json";

// import style.css from current directory
import "./style.css";

const defaultIndividual = {
  first_name: "",
  last_name: "",
  national_id: "",
  national_id_issue_place: "",
  date_of_birth: "",
  place_of_birth: "",
  job_title: "",
  salary: "",
  gender: "",
  partner_relationship: "",
  partner_relationship_status: "",
  mobile_number: "",
  email: "",
  address: "",
  location: "",
  family: null,
  mother: null,
  father: null,
  partner_id: null,
  status: "alive",
  is_head_of_family: false,
  stay_with_family: true,
  is_draft: true,
  notes: "",
  is_working: false,
};

const fields_tabs_mapping = {
  1: [
    "first_name",
    "first_name_tr",
    "last_name",
    "last_name_tr",
    "date_of_birth",
    "place_of_birth",
    "gender",
    "national_id",
    "national_id_issue_place",
    "status",
  ],
  2: ["father", "full_name_of_father", "mother", "partner_relationship"],
  3: ["job_title", "salary", "mobile_number", "email"],
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
  const [selectedFamily, setSelectedFamily] = useState({});
  const [dataSaved, setDataSaved] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [errorFields, setErrorFields] = useState([]);
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [sehirData, setSehirData] = useState([]);
  const [ilceData, setIlceData] = useState([]);
  const [mahalleData, setMahalleData] = useState([]);
  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";
  const [isOutsideCountrySelectedFather, setIsOutsideCountrySelectedFather] =
    useState(null);
  const [
    isOutsideCountrySelectedForMother,
    setIsOutsideCountrySelectedForMother,
  ] = useState(null);
  const [warningMessages, setWarningMessages] = useState({
    last_name_tr: "",
    first_name_tr: "",
    place_of_birth_tr: "",
  });

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

  //ProfileImage
  const [profileImage, setProfileImage] = useState(null);
  const [initialProfileImage, setInitialProfileImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setIndividual((prevIndividual) => ({
          ...prevIndividual,
          profile_image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getSehirData = async () => {
    try {
      const { data } = await instance.get("/cities/");
      setSehirData(data.results);
    } catch (e) {
      console.error(e);
    }
  };

  const getIlceData = async (city) => {
    try {
      const { data } = await instance.get(`/cities/${city.id}/districts/`);
      setIlceData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const getMahalleData = async (district) => {
    try {
      const { data } = await instance.get(
        `/districts/${district.id}/neighborhoods/`
      );
      setMahalleData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      // Convert base64 image to blob
      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();
      const file = new File([blob], "webcam_image.jpg", { type: "image/jpeg" });

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setIndividual((prevIndividual) => ({
          ...prevIndividual,
          profile_image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
      setShowWebcam(false);
    }
  };

  const toggleCamera = () => {
    setShowWebcam(!showWebcam);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // get visit id from query params (if the page is visited from a visits page)
  const visitId =
    new URLSearchParams(window.location.search).get("visit") ||
    individual?.last_updated_by_visit;

  // Get individual Details
  const getIndividualDetails = async () => {
    try {
      const { data } = await instance.get(`/individuals/${id}/`);
      data.mobile_number = data.mobile_number || data.family_mobile_number;
      setIndividual(data);
      setInitialProfileImage(data.profile_image);
      getFamilies(data.family);
      if (data.mother) {
        setIsOutsideCountrySelectedForMother(false);
      }
      if (data.mother_name_absent && data.mother_name_absent != "Unknown") {
        setIsOutsideCountrySelectedForMother(true);
      }

      if (data.father) {
        setIsOutsideCountrySelectedFather(false);
      }
      if (data.father_name_absent && data.father_name_absent != "Unknown") {
        setIsOutsideCountrySelectedFather(true);
      }

      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (e) {
      console.error(e);
      setErrorOccurred(true);
      setError(e.message);
    }
  };

  // Get Families list
  const getFamilies = async (familyId) => {
    try {
      const { data } = await instance.get(`/families/${familyId}/`);
      // Set selected family if you are targeting details page
      setSelectedFamily(data);
      const headOfFamily = data.individuals.find(
        (individual) => individual.is_head_of_family
      );
      if (headOfFamily) {
        setHeadOfFamily(headOfFamily);
        individual.mobile_number = headOfFamily.mobile_number;
      }
    } catch (e) {
      console.error(e);
      // setErrorOccurred(true);
      // setError(e.message);
    }
  };

  useEffect(() => {
    // set default values from family head if exists else one of family
    if (id && id !== "new") {
      getIndividualDetails();
    }

    getFamilies(familyId);
    getSehirData(setSehirData);

    const headOfFamily = selectedFamily?.individuals?.find(
      (individual) => individual.is_head_of_family
    );
    if (headOfFamily) {
      setIndividual((prevIndividual) => ({
        ...prevIndividual,
        mobile_number: headOfFamily.mobile_number,
        email: headOfFamily.email,
        address: headOfFamily.address,
        location: headOfFamily.location,
      }));
    }
  }, [id]);

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
    setIsFormSubmitted(true); // to show required fields
    setIsSaving(true);

    // const isInvalidForm = validateRequiredFields(individual.is_draft);
    const requiredFields = [
      "first_name",
      "first_name_tr",
      "last_name",
      "last_name_tr",
      "date_of_birth",
      "place_of_birth",
      "gender",
    ];

    var allRequiredFields = [
      ...requiredFields,
      "national_id",
      "national_id_issue_place",
      "mobile_number",
      "address",
      "partner_relationship",
    ];

    if (individual.is_working) {
      allRequiredFields.push("job_title", "salary");
    }

    if (["dead", "lost"].includes(individual.status)) {
      allRequiredFields = allRequiredFields.filter((field) => {
        // field not in requiredFields
        return ![
          "mobile_number",
          "national_id",
          "national_id_issue_place",
          "address",
        ].includes(field);
      });
    }

    var errorFields = [];

    // get error fields
    if (individual.is_draft) {
      errorFields = requiredFields.filter(
        (field) => !individual[field] || individual[field] === ""
      );
      setErrorFields(errorFields);
    } else {
      errorFields = allRequiredFields.filter(
        (field) => !individual[field] || individual[field] === ""
      );
      setErrorFields(errorFields);
    }

    const isInvalidForm = errorFields.length > 0;
    if (isInvalidForm) {
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
      profile_image: individual.profile_image || null,
    };

    if (payload.profile_image === initialProfileImage) {
      delete payload.profile_image;
    }

    try {
      // await (id && id !== "new"
      //   ? instance.put(`/individuals/${id}/`, payload)
      //   : instance.post("/individuals/", payload));
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
      // setTimeout(() => {
      //   navigate(-1);
      // }, 1500);
      setShowModal(true);
    } catch (e) {
      console.error(e);
      // setAlert({
      //   show: true,
      //   message: "Error",
      //   description: e,
      //   type: "error",
      // });
      setErrorFn(e, setErrorOccurred, setError);
    }
    setIsSaving(false);
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

  // Get current location
  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert(t("Geolocation is not supported by this browser."));
    }
  };

  const showPosition = (position) => {
    const newIndividual = { ...individual };
    newIndividual.location = `${position.coords.latitude},${position.coords.longitude}`;
    setIndividual(newIndividual);
    setLocationLoading(false);
  };

  const handleStringInput = (e, param) => {
    const value = e.target.value;
    // Use regex to allow only letters and spaces
    const regex = /^[^\d\u0660-\u0669\u06F0-\u06F9]*$/;

    if (regex.test(value)) {
      updateServerParams(value, param);
    }
  };

  const handleLocationChange = (latlng, address) => {
    updateServerParams(latlng, "location");
    updateServerParams(address, "address");
  };

  const getPartnerOptions = () => {
    if (individual && individual.gender == "male") {
      return selectedFamily?.individuals?.filter((x) => x.gender == "female");
    } else if (individual && individual.gender == "female") {
      return selectedFamily?.individuals?.filter((x) => x.gender == "male");
    } else {
      return selectedFamily?.individuals;
    }
  };

  // Handle input for TR
  const handleInputForTR = (e, param) => {
    const value = e.target.value;
    const regex = /^[a-zA-ZığüşöçİĞÜŞÖÇ ]*$/;

    if (regex.test(value)) {
      updateServerParams(value, param);
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        [param]: "",
      }));
    } else {
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        [param]: t("Only English or Turkish letters are allowed."),
      }));
    }
  };

  const handleKeyPressForTR = (e, param) => {
    const regex = /^[a-zA-ZığüşöçİĞÜŞÖÇ ]*$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        [param]: t("Only English or Turkish letters are allowed."),
      }));
    }
  };

  // Toggle manual address input and initialize dependent fields
  const [manualAddress, setManualAddress] = useState(false);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [selectedCityKey, setSelectedCityKey] = useState(null);
  const [selectedDistrictKey, setSelectedDistrictKey] = useState(null);
  const toggleManualAddress = () => {
    setManualAddress(!manualAddress);
    setIndividual((prevIndividual) => ({
      ...prevIndividual,
      address: manualAddress ? individual.address : "",
    }));
  };
  const handleCityChange = (value) => {
    setCity(value.name);
    setDistrict("");
    setNeighborhood("");
  };
  // Filtering districts based on selected city
  const filteredDistricts = ilceData.filter(
    (item) => item.ilce_sehirkey === selectedCityKey
  );

  // Filtering neighborhoods based on selected district
  const filteredNeighborhoods = mahalleData.filter(
    (item) => item.mahalle_ilcekey === selectedDistrictKey
  );

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        {/* {alert.show && (
          <Alert
            message={alert.message}
            description={alert.message}
            type={alert.type}
            onClose={() =>
              setAlert({ show: false, message: "", description: "", type: "" })
            }
          />
        )} */}

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
              <Col md={8}>
                <h6 className="page-title">
                  {id && id !== "new"
                    ? t("Edit Individual")
                    : t("Create Individual")}
                </h6>
              </Col>
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
                            {t("Family Information ")}
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
                            {t("Family Information ")}
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
                      {/* First name */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("First name")}</strong>
                            <span style={{ color: "red" }}> * *</span>
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
                        {/* "First name" in TR */}
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add First Name in TR")}
                            value={individual.first_name_tr}
                            onChange={(e) =>
                              handleInputForTR(e, "first_name_tr")
                            }
                            style={{
                              border: errorFields.find(
                                (x) => x === "first_name_tr"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                          {warningMessages.first_name_tr && (
                            <div className="alert-warning">
                              {warningMessages.first_name_tr}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Last name */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Last name")}</strong>
                            <span style={{ color: "red" }}> * *</span>
                          </p>
                        </div>
                        <div className="col-4">
                          <input
                            className="form-control required"
                            placeholder={t("Add Last Name")}
                            value={individual.last_name}
                            onChange={(e) => handleStringInput(e, "last_name")}
                            style={{
                              border: errorFields.find(
                                (x) => x === "first_name"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </div>
                        {/* "Last name" in TR */}
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add Last Name in TR")}
                            value={individual.last_name_tr}
                            onChange={(e) =>
                              handleInputForTR(e, "last_name_tr")
                            }
                            style={{
                              border: errorFields.find(
                                (x) => x === "last_name_tr"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                          {warningMessages.last_name_tr && (
                            <div className="alert-warning">
                              {warningMessages.last_name_tr}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Place of birth */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Place of birth")}</strong>
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

                        {/* "Place of birth" in TR */}
                        <div className="col-4">
                          <input
                            className="form-control"
                            placeholder={t("Add Place of birth in TR")}
                            value={individual.place_of_birth_tr}
                            onChange={(e) =>
                              handleInputForTR(e, "place_of_birth_tr")
                            }
                            onKeyPress={(e) =>
                              handleKeyPressForTR(e, "place_of_birth_tr")
                            }
                          />
                          {warningMessages.place_of_birth_tr && (
                            <div className="alert-warning">
                              {warningMessages.place_of_birth_tr}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* National ID Issue Place and National Id */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>
                              {t("National ID Issue Place / National Id")}
                            </strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <Autocomplete
                            name={t("IDIssuePlace")}
                            searchParam="name"
                            placeholder={
                              individual.national_id_issue_place ||
                              t("Select National ID Issue Place")
                            }
                            searchApi={false}
                            basePlaceholder={t(
                              "Select National ID Issue Place"
                            )}
                            list={sehirData}
                            selectedObject={(value) => {
                              updateServerParams(
                                value?.name,
                                "national_id_issue_place"
                              );
                            }}
                            isError={
                              isFormSubmitted &&
                              errorFields.find(
                                (x) => x === "national_id_issue_place"
                              )
                            }
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
                            {t("Date of birth")}{" "}
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
                      {/* Status */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Status")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className={`form-control form-select ${
                              isFormSubmitted && !individual.gender
                                ? "is-invalid"
                                : ""
                            }`}
                            value={individual.status}
                            onChange={(e) => {
                              updateServerParams(e.target.value, "status");
                            }}
                            style={{
                              border: errorFields.find((x) => x === "status")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="alive">{t("Alive")}</option>
                            <option value="dead">{t("Dead")}</option>
                            <option value="lost">{t("Lost")}</option>
                            <option value="InSyria">{t("In Syria")}</option>
                          </select>
                        </div>
                      </div>
                      {/* Is Head Of Family */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Is head of family")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              checked={individual.is_head_of_family}
                              type="checkbox"
                              role="switch"
                              onChange={(e) => {
                                updateServerParams(
                                  e.target.checked,
                                  "is_head_of_family"
                                );
                              }}
                            />
                          </div>
                        </div>
                        {/*  Stay with Family */}

                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Stay with family?")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              checked={individual.stay_with_family}
                              type="checkbox"
                              role="switch"
                              onChange={(e) => {
                                updateServerParams(
                                  e.target.checked,
                                  "stay_with_family"
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId={2}>
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Father")} </strong>
                          </p>
                        </div>
                        <div className="col-4 ">
                          <Autocomplete
                            name="Father"
                            searchParam="name"
                            placeholder={
                              individual?.father_name || t("Select a father")
                            }
                            searchApi={false}
                            list={selectedFamily?.individuals?.filter(
                              (x) => x.gender === "male"
                            )}
                            selectedObject={(value) => {
                              if (!value) {
                                updateServerParams(null, "father");
                                updateServerParams(null, "father_name");
                                updateServerParams(null, "father_partner_id"); // Reset partner_id
                              } else {
                                updateServerParams(value?.id, "father");
                                updateServerParams(
                                  value?.partner_id,
                                  "father_partner_id"
                                ); // Save partner_id for Mother
                              }
                            }}
                            isError={
                              isFormSubmitted && errorFields.includes("father")
                            }
                          />
                        </div>
                      </div>
                      {/* Father | This field will not be shown in individual create case 
              {id === "new" ? (
                <></>
              ) : (*/}
                      {/* Father | This field will not be shown in individual create case */}
                      {/* <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>
                              {t("Is the father outside the country?")}
                            </strong>
                          </p>
                        </div>
                        <div className="col-4 d-flex justify-content-center">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="fatherLocation"
                              id="fatherOutside"
                              value="yes"
                              checked={isOutsideCountrySelectedFather === true}
                              onChange={() =>
                                setIsOutsideCountrySelectedFather(true)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="fatherInside"
                            >
                              {t("Yes")}
                            </label>
                          </div>
                          <div className="form-check form-check-inline ms-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="fatherLocation"
                              id="fatherOutside"
                              value="no"
                              checked={isOutsideCountrySelectedFather === false}
                              onChange={() =>
                                setIsOutsideCountrySelectedFather(false)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="fatherOutside"
                            >
                              {t("No")}
                            </label>
                          </div>
                        </div>
                      </div>
                      {isOutsideCountrySelectedFather === false && (
                        <div className="row mb-4">
                          <div className="col-2 align-content-center">
                            <p className="m-0">
                              <strong>{t("Father")}</strong>
                            </p>
                          </div>
                          <div className="col-4">
                            <Autocomplete
                              className="form-control"
                              name="Father"
                              searchParam="name"
                              placeholder={
                                individual?.father_name || t("Select a father")
                              }
                              list={selectedFamily?.individuals?.filter(
                                (x) => x.gender === "male"
                              )}
                              selectedObject={(value) => {
                                if (!value) {
                                  updateServerParams(null, "father");
                                  updateServerParams(null, "father_name");
                                } else {
                                  updateServerParams(value?.id, "father");
                                }
                              }}
                              isError={
                                isFormSubmitted &&
                                errorFields.includes("father")
                              }
                            />
                          </div>
                        </div>
                      )}
                      {isOutsideCountrySelectedFather === true && (
                        <div className="row mb-4">
                          <div className="col-2 align-content-center">
                            <p className="m-0">
                              <strong>{t("Full Name of the Father")}</strong>
                            </p>
                          </div>
                          <div className="col-4">
                            <input
                              className="form-control"
                              placeholder={t(
                                "Enter the full name of the father"
                              )}
                              value={individual.full_name_of_father || ""}
                              onChange={(e) =>
                                updateServerParams(
                                  e.target.value,
                                  "full_name_of_father"
                                )
                              }
                            />
                          </div>
                        </div>
                      )} */}
                      {/* )} */}
                      {/* Mother | This field will not be shown in individual create case */}
                      {/* {id === "new" ? (
                <></>
              ) : ( */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Mother")}</strong>
                          </p>
                        </div>
                        <div className="col-4 ">
                          <Autocomplete
                            name="Mother"
                            searchParam="name"
                            placeholder={
                              individual?.mother_name || t("Select a mother")
                            }
                            searchApi={false}
                            list={selectedFamily?.individuals?.filter(
                              (x) =>
                                x.gender === "female" &&
                                (!individual.father_partner_id ||
                                  x.id === individual.father_partner_id)
                            )}
                            selectedObject={(value) => {
                              if (!value) {
                                updateServerParams(null, "mother");
                                updateServerParams(null, "mother_name");
                                updateServerParams(null, "mother_partner_id"); // Reset partner_id
                              } else {
                                updateServerParams(value?.id, "mother");
                                updateServerParams(
                                  value?.partner_id,
                                  "mother_partner_id"
                                );
                              }
                            }}
                            isError={
                              isFormSubmitted && errorFields.includes("mother")
                            }
                          />
                        </div>
                      </div>
                      {/* Mother | This field will not be shown in individual create case */}
                      {/* <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>
                              {t("Is the mother outside the country?")}
                            </strong>
                          </p>
                        </div>
                        <div className="col-4 d-flex justify-content-center">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="motherLocation"
                              id="motherInside"
                              checked={
                                isOutsideCountrySelectedForMother === true
                              }
                              value="yes"
                              onChange={() =>
                                setIsOutsideCountrySelectedForMother(true)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="motherInside"
                            >
                              {t("Yes")}
                            </label>
                          </div>
                          <div className="form-check form-check-inline ms-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="motherLocation"
                              id="motherOutside"
                              value="no"
                              checked={
                                isOutsideCountrySelectedForMother === false
                              }
                              onChange={() =>
                                setIsOutsideCountrySelectedForMother(false)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="motherOutside"
                            >
                              {t("No")}
                            </label>
                          </div>
                        </div>
                      </div>
                      {!isOutsideCountrySelectedForMother ? (
                        <div className="row mb-4">
                          <div className="col-2 align-content-center">
                            <p className="m-0">
                              <strong>{t("Mother")}</strong>
                            </p>
                          </div>
                          <div className="col-4">
                            <Autocomplete
                              className="form-control"
                              name="Mother"
                              searchParam="name"
                              placeholder={
                                individual?.mother_name || t("Select a mother")
                              }
                              list={selectedFamily?.individuals?.filter(
                                (x) => x.gender === "female"
                              )}
                              selectedObject={(value) => {
                                if (!value) {
                                  updateServerParams(null, "mother");
                                  updateServerParams(null, "mother_name");
                                } else {
                                  updateServerParams(value?.id, "mother");
                                }
                              }}
                              isError={
                                isFormSubmitted &&
                                errorFields.includes("mother")
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      {isOutsideCountrySelectedForMother && (
                        <div className="row mb-4">
                          <div className="col-2 align-content-center">
                            <p className="m-0">
                              <strong>{t("Full Name of the Mother")}</strong>
                            </p>
                          </div>
                          <div className="col-4">
                            <input
                              className="form-control"
                              placeholder={t(
                                "Enter the full name of the mother"
                              )}
                              value={individual.full_name_of_mother || ""}
                              onChange={(e) =>
                                updateServerParams(
                                  e.target.value,
                                  "full_name_of_mother"
                                )
                              }
                            />
                          </div>
                        </div>
                      )}

                       */}
                      {/* )} */}
                      {/* Relationship */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Relationship")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control form-select"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            style={{
                              border: errorFields.find(
                                (x) => x === "relationship"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">{t("Select Relationship")}</option>
                            <option value="husband">{t("Husband")}</option>
                            <option value="wife">{t("Wife")}</option>
                            <option value="mother">{t("Mother")}</option>
                            <option value="father">{t("Father")}</option>
                            <option value="brother">{t("Brother")}</option>
                            <option value="son">{t("Son")}</option>
                            <option value="daughter">{t("Daughter")}</option>
                            <option value="custom">{t("Custom")}</option>
                          </select>
                        </div>
                      </div>

                      {relationship === "custom" && (
                        <div className="row mb-4">
                          <div className="col-2 align-content-center">
                            <p className="m-0">
                              <strong>{t("Add Custom Relationship")}</strong>
                            </p>
                          </div>
                          <div className="col-4">
                            <input
                              className="form-control"
                              placeholder={t("Enter Custom Relationship")}
                              value={customRelationship}
                              onChange={(e) =>
                                setCustomRelationship(e.target.value)
                              }
                              style={{
                                border: errorFields.find(
                                  (x) => x === "customRelationship"
                                )
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Partner relation status */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Partner relationship")}</strong>
                            <span style={{ color: "red" }}> * </span>
                          </p>
                        </div>
                        <div className="col-4">
                          <select
                            className={`form-control form-select ${
                              isFormSubmitted && !individual.gender ? "" : ""
                            }`}
                            value={individual.partner_relationship}
                            onChange={(e) => {
                              updateServerParams(
                                e.target.value,
                                "partner_relationship"
                              );
                            }}
                            style={{
                              border: errorFields.find(
                                (x) => x === "partner_relationship"
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option>{t("Select a status")}</option>
                            <option value="single">{t("Single")}</option>
                            <option value="married">{t("Married")}</option>
                            <option value="divorced">{t("Divorced")}</option>
                            <option value="widow">{t("Widow")}</option>
                            <option value="engage">{t("Engage")}</option>
                            {/* TODO: add partnership status: good, tense, good tense */}
                            {/* <option value="good">Good</option>
                    <option value="tense">Tense</option>
                    <option value="good_tense">Good Tense</option> */}
                            <option value="extra_marital">
                              {t("Extra Marital")}l
                            </option>
                            <option value="separation">
                              {t("Separation")}
                            </option>
                          </select>
                        </div>
                      </div>
                      {["married", "engage", "widow", "divorced"].includes(
                        individual.partner_relationship
                      ) ? (
                        <>
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>
                                  {t("Partner relationship status")}
                                </strong>
                              </p>
                            </div>
                            <div className="col-4">
                              <select
                                className="form-control form-select"
                                value={individual.partner_relationship_status}
                                onChange={(e) => {
                                  updateServerParams(
                                    e.target.value,
                                    "partner_relationship_status"
                                  );
                                }}
                              >
                                <option>{t("Select a status")}</option>
                                <option value="good">{t("Good")}</option>
                                <option value="tense">{t("Tense")}</option>
                                <option value="good_tense">
                                  {t("Good Tense")}
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>{t("Partner")}</strong>
                              </p>
                            </div>
                            <div className="col-4 ">
                              <Autocomplete
                                name={t("Partner")}
                                searchParam="name"
                                placeholder={
                                  individual.partner_name ||
                                  t("Select a partner")
                                }
                                searchApi={false}
                                // placeholder={individual.partner_name || t("Select a partner")}
                                list={getPartnerOptions()}
                                selectedObject={(value) => {
                                  if (!value) {
                                    updateServerParams(null, "partner_name");
                                    updateServerParams(null, "partner_id");
                                  } else {
                                    updateServerParams(value?.id, "partner_id");
                                  }
                                }}
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "partner_id"
                                  )
                                    ? "1px solid red"
                                    : "1px solid #ced4da",
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
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
                            value={
                              individual.mobile_number ||
                              headOfFamily?.mobile_number
                            }
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
                          {!manualAddress ? (
                            <input
                              className="form-control"
                              placeholder={t("Add address")}
                              value={
                                individual.address || headOfFamily?.address
                              }
                              onChange={(e) =>
                                updateServerParams(e.target.value, "address")
                              }
                              style={{
                                border: errorFields.includes("address")
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          ) : (
                            <>
                              <div className="row mb-3">
                                <div className="col-6">
                                  <Autocomplete
                                    name={t("City")}
                                    searchParam="name"
                                    searchApi={false}
                                    placeholder={t("Select city")}
                                    list={sehirData}
                                    selectedObject={(value) => {
                                      setCity(value);
                                      getIlceData(value, setIlceData);
                                    }}
                                    className="form-control"
                                  />
                                </div>
                                <div className="col-6">
                                  <Autocomplete
                                    name={t("District")}
                                    searchParam="name"
                                    searchApi={false}
                                    placeholder={t("Select district")}
                                    list={ilceData}
                                    selectedObject={(value) => {
                                      setDistrict(value);
                                      getMahalleData(value, setMahalleData);
                                    }}
                                    className="form-control"
                                    disabled={!city}
                                  />
                                </div>
                              </div>

                              <div className="row mb-3">
                                <div className="col-6">
                                  <Autocomplete
                                    name={t("Neighborhood")}
                                    searchParam="name"
                                    searchApi={false}
                                    placeholder={t("Select neighborhood")}
                                    list={mahalleData}
                                    selectedObject={(value) =>
                                      setNeighborhood(
                                        value ? value.mahalle_title : ""
                                      )
                                    }
                                    className="form-control"
                                    disabled={!district}
                                  />
                                </div>
                                <div className="col-6">
                                  <input
                                    className="form-control"
                                    placeholder={t("Enter street")}
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-6">
                                  <input
                                    className="form-control"
                                    placeholder={t("Enter building")}
                                    value={building}
                                    onChange={(e) =>
                                      setBuilding(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="col-6">
                                  <input
                                    className="form-control"
                                    placeholder={t("Enter floor")}
                                    value={floor}
                                    onChange={(e) => setFloor(e.target.value)}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column">
                          <Button
                            color="primary"
                            style={{ width: "40%", marginBottom: "10px" }}
                            onClick={() => {
                              setShowMap(true);
                              setTimeout(() => {
                                document
                                  .querySelector(".map-address")
                                  .scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }}
                          >
                            {t("Find location (Map)")}
                          </Button>

                          <Button
                            color="secondary"
                            style={{ width: "40%" }}
                            onClick={toggleManualAddress}
                          >
                            {manualAddress
                              ? t("Cancel Manual Entry")
                              : t("Enter Manually")}
                          </Button>
                        </div>
                      </div>

                      {/* Location */}
                      {/* <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Location")}</strong>
                  </p>
                </div>
                <div className="col-6 d-flex">
                  <Button
                    color="primary"
                    className="text-nowrap"
                    onClick={() => {
                      getLocation();
                    }}
                  >
                    {locationLoading ? t("Loading...") : t("Find Location")}
                  </Button>
                  <input
                    className="form-control ms-3"
                    placeholder={t("Add location")}
                    value={individual.location}
                    onChange={(e) => {
                      updateServerParams(e.target.value, "location");
                    }}
                  />
                </div>
              </div> */}
                      <input
                        className="form-control ms-3"
                        placeholder={t("Add location")}
                        value={individual.location || headOfFamily?.location}
                        hidden={true}
                        onChange={(e) => {
                          updateServerParams(e.target.value, "location");
                        }}
                      />
                      {/* Family | THIS FIELD IS HIDDEN TEMPORARILY */}
                      {/* <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0"><strong>Family</strong></p>
                </div>
                <div className="col-10 ">
                  <Autocomplete
                    name="Family"
                    searchParam="title"
                    list={familyList}
                    placeholder={selectedFamily.title || "Select a family"}
                    selectedObject={(value) => {
                      updateServerParams(value, "family");
                      setSelectedFamily(value);
                    }}
                  />
                </div>
              </div> */}

                      {/* Location */}
                      {/* <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Location")}</strong>
                  </p>
                </div>
                <div className="col-6 d-flex">
                  <Button
                    color="primary"
                    className="text-nowrap"
                    onClick={() => {
                      getLocation();
                    }}
                  >
                    {locationLoading ? t("Loading...") : t("Find Location")}
                  </Button>
                  <input
                    className="form-control ms-3"
                    placeholder={t("Add location")}
                    value={individual.location}
                    onChange={(e) => {
                      updateServerParams(e.target.value, "location");
                    }}
                  />
                </div>
              </div> */}
                      <input
                        className="form-control ms-3"
                        placeholder={t("Add location")}
                        value={individual.location || headOfFamily?.location}
                        hidden={true}
                        onChange={(e) => {
                          updateServerParams(e.target.value, "location");
                        }}
                      />
                      {/* Family | THIS FIELD IS HIDDEN TEMPORARILY */}
                      {/* <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0"><strong>Family</strong></p>
                </div>
                <div className="col-10 ">
                  <Autocomplete
                    name="Family"
                    searchParam="title"
                    list={familyList}
                    placeholder={selectedFamily.title || "Select a family"}
                    selectedObject={(value) => {
                      updateServerParams(value, "family");
                      setSelectedFamily(value);
                    }}
                  />
                </div>
              </div> */}
                      <div
                        className="map-address"
                        style={{
                          display: showMap ? "block" : "none",
                          textAlign: "center",
                        }}
                      >
                        <MapAddress
                          apiKey="AIzaSyBGXK2AgiTATdXXSL4rGi1gCSYx8EOIDrw"
                          defaultCenter={{ lat: 40.73061, lng: -73.935242 }}
                          onLocationChange={handleLocationChange}
                        />
                        <Button
                          color="danger"
                          className="mt-2"
                          onClick={() => {
                            setShowMap(false);
                            setTimeout(() => {
                              document
                                .querySelector(".form-address")
                                .scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }}
                        >
                          {t("Close Map")}
                        </Button>
                      </div>
                    </TabPane>
                    <TabPane tabId={4}>
                      {/* Profile Image */}
                      <div className="d-flex justify-content-center align-items-center flex-column mb-4">
                        <div className="image-upload">
                          {showWebcam ? (
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              className="image-upload video"
                            />
                          ) : profileImage ? (
                            <img
                              src={profileImage}
                              alt="Profile"
                              className="image-upload img"
                            />
                          ) : (
                            <p>{t("Click to upload or take a photo")}</p>
                          )}
                        </div>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                            id="fileInput"
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection:
                                rtlDirection === "rtl" ? "row-reverse" : "row",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Button
                              color="primary"
                              onClick={() =>
                                showWebcam
                                  ? toggleCamera()
                                  : document.getElementById("fileInput").click()
                              }
                            >
                              {showWebcam
                                ? t("Close Camera")
                                : t("Upload Photo")}
                            </Button>

                            <Button
                              color="secondary"
                              onClick={showWebcam ? captureImage : toggleCamera}
                            >
                              {showWebcam
                                ? t("Capture Photo")
                                : t("Open Camera")}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Section for Medical Condition/Disability */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>
                              {t("Has Medical Condition/Disability")}
                            </strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              checked={individual.has_condition}
                              type="checkbox"
                              role="switch"
                              onChange={(e) => {
                                updateServerParams(
                                  e.target.checked,
                                  "has_condition"
                                );
                              }}
                              style={{
                                border: errorFields.find(
                                  (x) => x === "has_condition"
                                )
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {individual.has_condition ? (
                        <>
                          {/* Options for Disability or Illness */}
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>{t("Condition Type")}</strong>
                                <span style={{ color: "red" }}> * </span>
                              </p>
                            </div>
                            <div className="col-4">
                              <select
                                className={`form-control form-select ${
                                  isFormSubmitted && !individual.condition_type
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={individual.condition_type}
                                onChange={(e) =>
                                  updateServerParams(
                                    e.target.value,
                                    "condition_type"
                                  )
                                }
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "condition_type"
                                  )
                                    ? "1px solid red"
                                    : "1px solid #ced4da",
                                }}
                              >
                                <option>{t("Select condition type")}</option>
                                <option value="disability">
                                  {t("Disability")}
                                </option>
                                <option value="illness">{t("Illness")}</option>
                                <option value="illness_Disability">
                                  {t("Illness and Disability")}
                                </option>
                              </select>
                            </div>
                          </div>

                          {/* Condition Severity Section */}
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>{t("Condition Severity")}</strong>
                                <span style={{ color: "red" }}> * </span>
                              </p>
                            </div>
                            <div className="col-4">
                              <select
                                className="form-control form-select"
                                value={individual.condition_severity}
                                onChange={(e) =>
                                  updateServerParams(
                                    e.target.value,
                                    "condition_severity"
                                  )
                                }
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "condition_severity"
                                  )
                                    ? "1px solid red"
                                    : "1px solid #ced4da",
                                }}
                              >
                                <option>{t("Select severity level")}</option>

                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </select>
                            </div>
                          </div>

                          {/* Field for Details about the Condition */}
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>{t("Condition Details")}</strong>
                                <span style={{ color: "red" }}> * </span>
                              </p>
                            </div>
                            <div className="col-4">
                              <input
                                className="form-control"
                                placeholder={t(
                                  "Add details about the condition"
                                )}
                                value={individual.condition_details}
                                onChange={(e) =>
                                  handleStringInput(e, "condition_details")
                                }
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "condition_details"
                                  )
                                    ? "1px solid red"
                                    : "1px solid #ced4da",
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                      {/* Notes */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Notes")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            maxLength="225"
                            rows="5"
                            placeholder={t("Add Extra Info")}
                            value={individual.notes}
                            onChange={(e) => {
                              updateServerParams(e.target.value, "notes");
                            }}
                          ></textarea>
                        </div>
                      </div>
                      {/* is working */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Is Working")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check form-switch">
                            <input
                              className={`form-check-input `}
                              checked={individual.is_working}
                              type="checkbox"
                              role="switch"
                              onChange={(e) => {
                                updateServerParams(
                                  e.target.checked,
                                  "is_working"
                                );
                              }}
                              style={{
                                border: errorFields.find(
                                  (x) => x === "is_working"
                                )
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {individual.is_working ? (
                        <>
                          <div className="row mb-4">
                            <div className="col-2 align-content-center">
                              <p className="m-0">
                                <strong>{t("Job title")}</strong>
                                <span style={{ color: "red" }}> * </span>
                              </p>
                            </div>
                            <div className="col-4">
                              <input
                                className="form-control"
                                placeholder={t("Add job title")}
                                value={individual.job_title}
                                onChange={(e) =>
                                  handleStringInput(e, "job_title")
                                }
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "job_title"
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
                                <strong>{t("Salary")}</strong>
                                <span style={{ color: "red" }}> * </span>
                              </p>
                            </div>
                            <div className="col-4">
                              <input
                                className="form-control"
                                placeholder={t("Add salary")}
                                type="number"
                                inputMode="numeric"
                                pattern="\d*"
                                min="0"
                                value={individual.salary}
                                onChange={(e) => {
                                  updateServerParams(e.target.value, "salary");
                                }}
                                style={{
                                  border: errorFields.find(
                                    (x) => x === "salary"
                                  )
                                    ? "1px solid red"
                                    : "1px solid #ced4da",
                                }}
                              />
                            </div>
                          </div>{" "}
                        </>
                      ) : (
                        <></>
                      )}
                      {/* Is Draft */}
                      <div className="row mb-4">
                        <div className="col-2 align-content-center">
                          <p className="m-0">
                            <strong>{t("Is draft")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={individual.is_draft}
                              onChange={(e) => {
                                updateServerParams(
                                  e.target.checked,
                                  "is_draft"
                                );
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
                            {t("The individual has been saved successfully!")}
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
                          {t("Go to Family Details")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleAddNewIndividual}
                        >
                          {t("Add New Individual")}
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
