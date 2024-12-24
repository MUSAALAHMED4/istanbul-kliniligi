import React, { useEffect, useState, useContext } from "react";
import instance from "base_url";
import Autocomplete from "components/Common/Autocomplete";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { validateRequiredFields, setErrorFn } from "../Utility/Functions";

export default function CreateOrEditVolunteer() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [individualList, setIndividualList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [error, setError] = useState("An Error Occurred");
  const [dataSaved, setDataSaved] = useState(false);
  const [rtlDirection, setRtlDirection] = useState("ltr");


  useEffect(() => {
    setRtlDirection(i18n.language === "ar" ? "rtl" : "ltr");
  }, [i18n.language]);



  // Get Volunteer Details
  const getVolunteerDetails = async () => {
    try {
      const { data } = await instance.get(`/volunteers/${id}/`);
      data.individual_id = data.individual.id;
      data.manager_id = data.manager?.id;
      setVolunteer(data);
    } catch (e) {
      console.error(e);
    }
  };

  // get Individuals
  const getIndividuals = async (search) => {
    try {
      let data;
      if (search) {
        const response = await instance.get(`/individuals/?search=${search}`);
        data = response.data;
      } else {
        const response = await instance.get("/individuals/");
        data = response.data;
      }
      data.results.forEach((el) => {
        el.name = `${el.first_name} ${el.last_name}`;
      });
      setIndividualList(
        data.results.filter((x) => x.status !== "lost" || x.status !== "dead")
      );
      setErrorOccurred(false);
    } catch (e) {
      console.log(e);
      setErrorOccurred(true);
    }
  };

  // get Volunteers
  const getVolunteers = async (search) => {
    try {
      let data;
      if (search) {
        const response = await instance.get(`/volunteers/?search=${search}`);
        data = response.data;
      } else {
        const response = await instance.get("/volunteers/");
        data = response.data;
      }
      data.results.forEach((el) => {
        el.name = `${el.individual.first_name} ${el.individual.last_name}`;
      });
      setVolunteerList(data.results);
      setErrorOccurred(false);
    } catch (e) {
      console.log(e);
      setErrorOccurred(true);
    }
  };

  useEffect(() => {
    getIndividuals();
    getVolunteers();
    if (id) {
      getVolunteerDetails();
    }
  }, []);

  const updateServerParams = (value, param) => {
    const newVolunteer = { ...volunteer };
    newVolunteer[param] = value;
    setVolunteer(newVolunteer);
    console.log(newVolunteer);
  };

  const saveVolunteer = async () => {
    // const isInvalidForm = validateRequiredFields();
    // if (isInvalidForm) {
    //   return;
    // }

    let res;

    if (id && id !== "new") {
      try {
        res = await instance.put(`/volunteers/${id}/`, volunteer);
      } catch (e) {
        console.error(e);
        setErrorOccurred(true);
        return;
      }
    } else {
      try {
        res = await instance.post("/volunteers/", volunteer);
      } catch (e) {
        console.error(e);
        setErrorOccurred(true);
        setErrorFn(e, setErrorOccurred, setError);
        setError(e.response?.data?.error);
        return;
      }
    }

    if (res.status === 200 || res.status === 201) {
      setDataSaved(true);
      navigate(-1);
    } else {
      console.error(res);
      setErrorOccurred(true);
      setError(res.message);
    }

    // try {
    //   const res = (await id && id !== "new")
    //     ? instance.put(`/volunteers/${id}/`, volunteer)
    //     : instance.post("/volunteers/", volunteer);
    //     if (res.status === 200 || res.status === 201) {
    //       setDataSaved(true);
    //       navigate(-1);
    //     } else {
    //       console.error(res);
    //     }
    //     // setTimeout(() => {
    //     //   navigate(-1);
    //     // }, 1500);
    // } catch (e) {
    //   console.error(e);
    // }
  };

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        <Container fluid>
          {errorOccurred && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={8}>
                <h6 className="page-title">
                  {id && id !== "new"
                    ? t("Edit Volunteer")
                    : t("Create Volunteer")}
                </h6>
              </Col>
            </Row>
            <div className="form-page-container">
              {/* Individual */}
              <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Individual")}</strong>
                    <span style={{ color: "red" }}> * </span>
                  </p>
                </div>
                <div className="col-10 ">
                  <Autocomplete
                    name="Individual"
                    searchMethod={getIndividuals}
                    searchParam="name"
                    list={individualList}
                    placeholder={
                      volunteer?.individual?.name || t("Select Individual")
                    }
                    selectedObject={(value) => {
                      updateServerParams(value?.id, "individual_id");
                    }}
                    required={true}
                  />
                </div>
              </div>

              {/* Manager */}
              <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Manager")}</strong>
                    <span style={{ color: "red" }}> * </span>
                  </p>
                </div>
                <div className="col-10 ">
                  <Autocomplete
                    name={t("manager")}
                    searchMethod={getVolunteers}
                    searchParam="name"
                    list={volunteerList}
                    placeholder={
                      volunteer?.manager?.name ||
                      `${t("Select")} ${t("manager")}`
                    }
                    selectedObject={(value) => {
                      updateServerParams(value?.id, "manager_id");
                    }}
                    required={true}
                  />
                </div>
              </div>

              {/* Position */}
              <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Position")}</strong>
                    <span style={{ color: "red" }}> * </span>
                  </p>
                </div>
                <div className="col-10">
                  <input
                    className="form-control"
                    placeholder={t("Add Position")}
                    value={volunteer ? volunteer.position : ""}
                    onChange={(value) => {
                      updateServerParams(value.target.value, "position");
                    }}
                    required={true}
                  />
                </div>
              </div>

              {/* Extra Info */}
              <div className="row mb-4">
                <div className="col-2 align-content-center">
                  <p className="m-0">
                    <strong>{t("Extra Info")}</strong>
                  </p>
                </div>
                <div className="col-10">
                  <textarea
                    className="form-control"
                    maxlength="225"
                    rows="5"
                    placeholder={t("Add Extra Info")}
                    value={volunteer ? volunteer.extra_info : ""}
                    onChange={(value) => {
                      updateServerParams(value.target.value, "extra_info");
                    }}
                    required={true}
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <Button
                onClick={() => {
                  saveVolunteer();
                }}
              >
                {t("Save")}
              </Button>
              {dataSaved && (
                <div className="alert alert-success mt-3" role="alert">
                  {t("Volunteer saved successfully!")}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
