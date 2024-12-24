import React, { useEffect, useState, useContext } from "react";
import AuthContext from "context/AuthContext";
import { useTranslation } from "react-i18next";

// Components
import Autocomplete from "components/Common/Autocomplete";
import { Container, Row, Col, Button } from "reactstrap";
import instance from "base_url";
import { useLocation, useNavigate } from "react-router-dom";
import { validateRequiredFields, setErrorFn } from "../Utility/Functions";

export default function CreateSupport() {
  const navigate = useNavigate();
  const { t , i18n} = useTranslation();
  const { state } = useLocation();
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [supportTypes, setSupportTypes] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [serverParams, setServerParams] = useState({});
  const [visit, setVisit] = useState({});
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [error, setError] = useState("");
  




  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";


  // Get Support Type
  const getSupportTypes = async () => {
    try {
      const { data } = await instance.get("/support-type/");
      setSupportTypes(data.results);
    } catch (e) {
      console.error(e);
    }
  };

  // get Volunteers
  const getVolunteers = async () => {
    try {
      const { data } = await instance.get("/volunteers/");
      setVolunteersList(data.results);
    } catch (e) {
      console.log(e);
    }
  };

  // get Families
  const getFamilies = async () => {
    try {
      const { data } = await instance.get("/families/");
      setFamilyList(data.results);
    } catch (e) {
      console.log(e);
    }
  };

  const getVisitDetails = async () => {
    try {
      const { data } = await instance.get(`/visit/${state}`);
      setVisit(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getSupportTypes();
    getVolunteers();
    getFamilies();
    if (state) {
      getVisitDetails();
    }
  }, []);

  const updateServerParams = (value, param) => {
    const newServerParams = { ...serverParams };
    newServerParams[param] = value;
    setServerParams(newServerParams);
    console.log(newServerParams);
  };

  const saveSupport = async () => {
    const isInvalidForm = validateRequiredFields();
    if (isInvalidForm) {
      return
    }
    const payload = { ...serverParams, volunteer: selectedVolunteerId, visit: state, family_id: selectedFamilyId };
    if (visit && visit.individual) {
      payload.individual_id = visit.individual.id;
    }
    try {
      const res = await instance.post("/support/", payload);
      navigate(`/visit/${state}`);
    } catch (e) {
      console.error(e);
      setErrorFn(e, setErrorOccurred, setError);
    }
  };

  const selectedFamilyId = new URLSearchParams(window.location.search).get(
    "familyid"
  );
  const selectedFamily = familyList.find(
    (family) => family.id === +selectedFamilyId
  );

  const selectedVolunteerId = new URLSearchParams(window.location.search).get(
    "volunteerid"
  );
  const selectedVolunteer = volunteersList.find(
    (volunteer) => volunteer.id === +selectedVolunteerId
  );

  return (
    <div className="page-content" dir={rtlDirection}>
      <Container fluid>
      {
          errorOccurred &&
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        }
        <div className="page-title-box">
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <h6 className="page-title">{t("Create New Support")}</h6>
            </Col>
          </Row>

          <div className="form-page-container">
            {isEmployee ? (
              <div>
                {/* Support Type */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Support Type")}</strong>
                    </p>
                  </div>
                  <div className="col-10">
                    <select
                      className="form-control form-select"
                      onChange={(e) => {
                        updateServerParams(
                          Number(e.target.value),
                          "support_type_id"
                        );
                      }}
                      required={true}
                    >
                      <option value="">{t("Select Support Type")}</option>
                      {supportTypes.map((type, index) => (
                        <option key={index} value={type.id}>
                         {t(type.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Volunteer */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Volunteer")}</strong>
                    </p>
                  </div>
                  <div className="col-10 ">
                    {/* <Autocomplete
                      name="Volunteer"
                      searchParam="name"
                      placeholder={selectedVolunteer?.individual.first_name}
                      list={volunteersList.map((item) => item.individual)}
                      selectedObject={(value) => {
                        updateServerParams(value?.id, "volunteer");
                      }}
                    /> */}
                    <input className="form-control" placeholder={selectedVolunteer?.individual.name} readOnly />
                  </div>
                </div>

                {/* Family */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Family")}</strong>
                    </p>
                  </div>
                  <div className="col-10 ">
                    {/* <Autocomplete
                      name="Family"
                      searchParam="title"
                      placeholder={selectedFamily?.title}
                      list={familyList}
                      selectedObject={(value) => {
                        updateServerParams(value?.id, "family_id");
                      }}
                    /> */}
                    <input className="form-control" placeholder={selectedFamily?.title} readOnly />
                  </div>
                </div>

                {/* Individual */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Individual")}</strong>
                    </p>
                  </div>
                  <div className="col-10">
                    {/* {familyList.length ? (
                      <Autocomplete
                        name="Individual"
                        searchParam="name"
                        list={familyList[0].individuals}
                        selectedObject={(value) => {
                          updateServerParams(value?.id, "individual_id");
                        }}
                      />
                    ) : (
                      <input
                        className="form-control"
                        placeholder={t("Select Family First!")}
                        readOnly
                      />
                    )} */}
                    <input className="form-control" placeholder={visit?.individual?.name} readOnly />
                  </div>
                </div>

                {/* frequency */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Frequency")}</strong>
                    </p>
                  </div>
                  <div className="col-10">
                    <select
                      className="form-control form-select"
                      onChange={(value) => {
                        updateServerParams(value.target.value, "frequency");
                      }}
                    >
                      <option value="once">{t("Once")}</option>
                      <option value="daily">{t("Daily")}</option>
                      <option value="weekly">{t("Weekly")}</option>
                      <option value="monthly">{t("Monthly")}</option>
                    </select>
                  </div>
                </div>

                {/* Visit Notes */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Notes")}</strong>
                    </p>
                  </div>
                  <div className="col-10">
                    <textarea
                      id="notes"
                      name="notes"
                      className="form-control"
                      maxLength="225"
                      rows="5"
                      placeholder={t("Add notes about the support")}
                      onChange={(value) => {
                        updateServerParams(value.target.value, "notes");
                      }}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              // Volunteer Support Suggestion
              <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Volunteer Notes")}</strong>
                  </p>
                </div>
                <div className="col-10">
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    maxlength="225"
                    rows="5"
                    placeholder={t("Add notes about the support")}
                    onChange={(value) => {
                      updateServerParams(value.target.value, "volunteer_notes");
                    }}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Actions */}
            <Button
              color="primary"
              onClick={() => {
                saveSupport();
              }}
            >
             {t("Save")} 
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
