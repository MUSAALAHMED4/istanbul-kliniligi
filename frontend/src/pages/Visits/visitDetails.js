import instance from "base_url";
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Dropdown } from "reactstrap";
import Autocomplete from "components/Common/Autocomplete";
import AuthContext from "context/AuthContext";
import moment from "moment/moment";
import Modal from "react-bootstrap/Modal";
import { withTranslation, useTranslation } from "react-i18next";

 function VisitDetails({ t }) {
  const { i18n } = useTranslation();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [visit, setVisit] = useState({});
  const [volunteersList, setVolunteersList] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [individualList, setIndividualList] = useState([]);
  const [requestStatues, setRequestStatues] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [supportPayload, setSupportPayload] = useState({});
  const [isRefresh, setIsRefresh] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);


  
  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";


  const updateSupportPayload = (value, param) => {
    const newSupportPayload = { ...supportPayload };
    newSupportPayload[param] = value;
    setSupportPayload(newSupportPayload);
    console.log("supportpayload", newSupportPayload);
  };

  // Create Support
  const createSupport = async () => {
    const payload = { ...supportPayload };
    payload.visit = id;
    try {
      const res = instance.post("/support/", payload);
      handleClose();
      setRequestStatues({
        status: "success",
        text: t("Support Suggested!"),
      });
      setIsRefresh(!isRefresh);
    } catch (e) {
      console.error(e);
    }
  };

  // Get Visit Details
  const getVisitDetails = async () => {
    try {
      const { data } = await instance.get(`/visits/${id}/`);
      data.family_id = data.family.id;
      setVisit(data);
      // setIsRefresh(!isRefresh);
    } catch (e) {
      console.error(e);
    }
  };

  // get Volunteers
  const getVolunteers = async (search) => {
    try {
      let data = [];
      if (search) {    
        const response = await instance.get(`/volunteers/?search=${search}`);
        data = response.data;
      } else {
        const response = await instance.get("/volunteers/");
        data = response.data;
      }
      setVolunteersList(data.results);
    } catch (e) {
      console.log(e);
    }
  };
  // get Families
  const getFamilies = async (search) => {
    try {
      let data = [];
      if (search) {
        const response = await instance.get(`/families/?search=${search}`);
        data = response.data;
      } else {
        const response = await instance.get("/families/");
        data = response.data;
      }
      setFamilyList(data.results);
    } catch (e) {
      console.log(e);
    }
  };

  // get Individuals
  const getIndividuals = async () => {
    try {
      const { data } = await instance.get(
        `/families/${state.family?.id}/individuals/`
      );
      data[0].name = `${data[0].first_name} ${data[0].last_name}`;
      setIndividualList(data);
    } catch (e) {
      console.log(e);
    }
  };

  // Update server params on fields change
  const updateVisitData = (value, param) => {
    const newVisit = { ...visit };
    newVisit[param] = value;
    setVisit(newVisit);

    if (param === "family_id") {
      const familyIndividualList = [
        ...familyList.find((item) => item.id === value?.id).individuals,
      ];
      familyIndividualList.forEach((item) => {
        item.name = `${item.first_name} ${item.last_name}`;
      });
      setIndividualList(familyIndividualList);
      const newVisit = { ...visit };
      newVisit.family = value?.id;
      setVisit(newVisit);
    }
    console.log(visit.duration)
  };

  useEffect(() => {
    getVisitDetails();
    if (isEmployee) {
      getVolunteers();
    }
    getFamilies();
    getIndividuals();
  }, [isRefresh]);

  useEffect(() => {
    if (visit.visit_status === "completed" || visit.visit_status === "cancelled" || visit.visit_status === "draft"   ) {
      setReadOnly(true);
    }
  }, [visit]);

  const saveVisit = async () => {
    try {
      const res = await instance.put(`/visits/${id}/`, visit);
      setRequestStatues({
        status: "success",
        text: t("Visit Updated!"),
      });
      setTimeout(() => {
        setRequestStatues(null);
        navigate(-1)
      }, 2000);
    } catch (e) {
      console.error(e);
      setRequestStatues({
        status: "danger",
        text: t("An Error Occurred!"),
      });
    }
  };

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        <Container fluid>
          <h4 className="my-4">{t("Visit Details")}: {visit.family?.title}</h4>
          <div className="form-page-container">
            {/* Volunteer */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Volunteer")}</strong>
                </p>
              </div>
              <div
                className={
                  isEmployee ? "col-md-8 col-12 mb-1" : "col-md-10 col-12"
                }
              >
                {isEmployee && visit.volunteer_name ? (
                  <Autocomplete
                    name="Volunteer"
                    searchParam="name"
                    searchMethod={getVolunteers}
                    placeholder={visit.volunteer_name}
                    list={volunteersList.map((item) => item.individual)}
                    selectedObject={(value) => {
                      updateVisitData(value?.id, "volunteer");
                    }}
                  />
                ) : (
                  <input
                    className="form-control"
                    value={visit.volunteer_name}
                    readOnly
                  />
                )}
              </div>
              {isEmployee ? (
                <div className="col-md-2 col-12  d-flex align-items-center">
                  <Link
                    to="/volunteer/new"
                    className="btn btn-primary w-100"
                    color="primary"
                  >
                    <i className="fas fa-plus-circle me-1"></i> {t("Create Volunteer")}
                  </Link>
                </div>
              ) : (
                <></>
              )}
            </div>

            {/* Family */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Family")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                  <div className="d-flex w-100">
                    <div className="w-100 me-2 ">
                      {isEmployee && !readOnly ? (
                        <Autocomplete
                          name="Family"
                          searchParam="title"
                          searchMethod={getFamilies}
                          placeholder={visit.family?.title || t("Select Family")}
                          list={familyList}
                          selectedObject={(value) => {
                            updateVisitData(value, "family_id");
                          }}
                        />
                      ) : (
                        <input
                          className="form-control"
                          value={visit.family?.title}
                          readOnly
                        />
                      )}
                    </div>
                    {!readOnly &&
                    <Link
                      to={`/family/${visit.family?.id}?visit=${id}`}
                      state={visit.family}
                      className="btn btn-primary me-2"
                      color="primary"
                    >
                      <i className="fas fa-pen"></i>
                    </Link>}
                    {isEmployee && !readOnly ? (
                      <Link
                        to="/individual/new"
                        className="btn btn-primary"
                        color="primary"
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Link>) : <></>}
                  </div>
              </div>
            </div>

            {/* Individual */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Individual")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12 ">
                { isEmployee && !readOnly ? (
                  <Autocomplete
                    name="Individual"
                    searchParam="name"
                    searchApi={false}
                    placeholder={visit.individual?.name || t("Select Individual")}
                    list={individualList}
                    selectedObject={(value) => {
                      updateVisitData(value?.id, "individual");
                    }}
                  /> ) : (
                  <input
                    className="form-control"
                    value={visit.individual?.name || t("No Individual Selected")}
                    readOnly /> )}
              </div>
            </div>

            {/* Visit Requester */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Visit Requester")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                <input
                  className="form-control"
                  value={visit.visit_requester_name || t("Requester Not Available")}
                  readOnly
                />
              </div>
            </div>

            {/* Visit Date */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Visit Date")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                {visit && (
                  <input
                    class="form-control"
                    type="date"
                    max="9999-12-31"
                    id="visit_date"
                    name="visit_date"
                    // value={moment(visit.visit_date).format("YYYY-MM-DDTh:mm")}
                    value={
                      visit.visit_date
                      ? `${moment(visit.visit_date).locale(i18n.language).format("YYYY-MM-DD")}`
                      : ""
                    }
                    
                    onChange={(e) => {
                      updateVisitData(e.target.value, "visit_date");
                    }}
                    readOnly={readOnly}
                  ></input>
                )}
              </div>
            </div>

            {/* Visit Purpose */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Visit Purpose")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                <input
                  className="form-control"
                  placeholder={t("Enter Visit Purpose")}
                  value={visit.visit_purpose}
                  {...(!isEmployee ? { readOnly: true } : {})}
                  onChange={(e) => {
                    updateVisitData(e.target.value, "visit_purpose");
                  }}
                  readOnly={!isEmployee || readOnly}  
                />
              </div>
            </div>

            {/* Visit Duration */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Visit Duration (Min 5 minutes)")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                <input
                  className="form-control"
                  type="number"
                  value={visit.duration}
                  min="5"
                  onChange={(e) => {
                    updateVisitData(Number(e.target.value), "duration");
                  }}
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* Visit Status */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Visit Status")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                {!readOnly ?
                  <select
                    className="form-control form-select"
                    value={t(visit.visit_status)} 
                    onChange={(value) => {
                      updateVisitData(value.target.value, "visit_status");
                    }}
                  >
                    {/* <option value="requested">{t("Requested")}</option> */}
                   
                    <option value="pending">{t("Pending")}</option>
                    <option value="draft">{t("Draft")}</option>
                    <option value="completed">{t("Completed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                  </select> 
                  :
                  <input
                    className="form-control"
                    value={t(visit.visit_status)} 
                    readOnly
                  /> }
              </div>
            </div>

            {/* Volunteer Notes */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Volunteer Notes")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  maxlength="225"
                  rows="2"
                  placeholder={t("Volunteer Notes")}
                  value={visit.volunteer_notes}
                  onChange={(value) => {
                    updateVisitData(value.target.value, "volunteer_notes");
                  }}
                  readOnly={isEmployee || (visit.visit_status !== "draft" && !isEmployee)} 
                ></textarea>
              </div>
            </div>

            {/* Visit Notes */}
            <div className="row mb-4">
              <div className="col-md-2 col-12 align-content-center">
                <p className="m-0">
                  <strong>{t("Notes")}</strong>
                </p>
              </div>
              <div className="col-md-10 col-12">
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  maxlength="225"
                  rows="5"
                  placeholder={t("Add notes about the visit")} 
                  value={visit.visit_notes}
                  onChange={(value) => {
                    updateVisitData(value.target.value, "visit_notes");
                  }}
                  {...(!isEmployee ? { readOnly: true } : {})}
                  readOnly={(!isEmployee && visit.visit_status !== "draft") || (isEmployee && visit.visit_status !== "draft" && readOnly)} 
                ></textarea>
              </div>
            </div>

            {/* Actions */}

            <div className="d-flex align-items-center">
              <Button
                color="primary"
                onClick={() => {
                  saveVisit();
                }}
                className="me-2"
                disabled={readOnly && !isEmployee}
              >
                {t("Save")}
              </Button>
              {!isEmployee ? (
                <Button variant="primary" onClick={handleShow}
                 disabled={visit?.visit_status == 'cancelled'  || visit?.visit_status == 'completed' 
                 }>
                  {t("Suggest Support")}
                </Button>
              ) : (
                <Link
                  to={`/create-support?volunteerid=${visit?.volunteer_id}&familyid=${visit?.family_id}`}
                  state={visit.id}
                  className={`btn btn-secondary ms-2 ${visit?.visit_status == 'cancelled' ? "disabled" : ""}`}
                
                >
                  {t("Create Support")}
                </Link>
              )}
            </div>
            {requestStatues && (
              <div
                class={`mt-3 alert alert-${requestStatues.status}`}
                role="alert"
              >
                {requestStatues.text}
              </div>
            )}
          </div>

          {/* Support Modal */}
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{t("Support Suggestion")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row mb-4">
                <div className="col-md-2 col-12 align-content-center">
                  <p className="m-0">
                    <strong>{t("Support Description")}</strong>
                  </p>
                </div>
                <div className="col-md-10 col-12">
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    maxlength="225"
                    rows="5"
                    placeholder={t("Add notes about the support")} 
                    onChange={(value) => {
                      updateSupportPayload(
                        value.target.value,
                        "volunteer_notes"
                      );
                    }}
                  ></textarea>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
              {t("Close")}
              </Button>
              <Button variant="primary" onClick={createSupport}>
              {t("Send")}
              </Button>
            </Modal.Footer>
          </Modal>

          {visit.support?.length ? (
            <div className="form-page-container mt-3">
              <h6 className="page-title mb-3">
              {isEmployee ? t("Supports") : t("Support Suggestion")}
              </h6>
              {/* Supports Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="bg-dark">
                    <tr>
                      <th scope="col">{t("Support Type")}</th>
                      <th scope="col">{t("Individual")}</th>
                      <th scope="col">{t("Family")}</th>
                      <th scope="col">{t("Volunteer")}</th>
                      <th scope="col">{t("Status")}</th>
                      {isEmployee && (
                        <th scope="col" className="text-center">
                           {t("Action")}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visit.support.map((item, index) => (
                      <tr key={index}>
                        <td>{item.support_type?.name}</td>
                        <td>{item.individual?.name}</td>
                        <td>{item.family?.title}</td>
                        <td>{item.volunteer.name}</td>
                        <td>
                        {t(item.status)}{" "}
                          {item.status === "approved" ? (
                            <i className="fas fa-check-circle text-success"></i>
                          ) : item.status === "pending" ? (
                            <i className="fas fa-clock text-warning"></i>
                          ) : (
                            <i className="fas fa-times-circle text-danger"></i>
                          )}
                        </td>
                        {isEmployee && (
                          <td className="text-center">
                            <Link
                              to={`/support/${item.id}?visit=${id}`}
                              className="btn btn-primary"
                            >
                              {t("Details")}
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <></>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
export default withTranslation()(VisitDetails);