import React, { useEffect, useState, useContext } from "react";
import Autocomplete from "components/Common/Autocomplete";
import { Link } from "react-router-dom";
import instance from "base_url";
import AuthContext from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { validateRequiredFields } from "../Utility/Functions";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { Button, Container } from "reactstrap";

import { setErrorFn } from "../Utility/Functions";

function CreateVisit({ t }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [error, setError] = useState("An Error Occurred");
  const [serverParams, setServerParams] = useState({});
  const [volunteersList, setVolunteersList] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [individualList, setIndividualList] = useState([]);
  const [dataSaved, setDataSaved] = useState(false);
  const [rtlDirection, setRtlDirection] = useState("ltr"); 
  const { i18n } = useTranslation();
 

  // Set RTL direction
  useEffect(() => {
    setRtlDirection(i18n.language === "ar" ? "rtl" : "ltr");
  }, [i18n.language]);


  // get Volunteers
  const getVolunteers = async (search)=>{
    try {
      let data = [];
      if (search){
        const response = await instance.get(`/volunteers/?search=${search}`)
        data = response.data
      } else {
        const response = await instance.get('/volunteers/')
        data = response.data
      }
      setVolunteersList(data.results)
    } catch (e){
      console.log(e)
      setErrorFn(e, setErrorOccurred, setError)
    }
  };
  // get Families
  const getFamilies = async (search)=>{
    try {
      let data = [];
      if (search){
        const response = await instance.get(`/families/?search=${search}`)
        data = response.data
      } else {
        const response = await instance.get('/families/')
        data = response.data
      }
          
      setFamilyList(data.results)
    } catch (e){
      console.log(e)
      setErrorFn(e, setErrorOccurred, setError)
    }
  };
  // get Individuals
  const getIndividuals = async () => {
    try {
      const { data } = await instance.get("/individuals/");
      data.results.forEach((el) => {
        el.name = `${el.first_name} ${el.last_name}`;
      });
      setIndividualList(data.results);
    } catch (e) {
      console.log(e);
      setErrorFn(e, setErrorOccurred, setError);
    }
  };

  useEffect(() => {
    getVolunteers();
    getFamilies();
    // getIndividuals()
  }, []);

  // Update server params on fields change
  const updateServerParams = (value, param) => {
    if (["volunteer", "visit_responsible"].includes(param)) {
      const newValue = volunteersList.find(
        (item) => item.individual.id === value
      ).id;
      value = newValue;
    }
    if (param === "family_id") {
      const familyIndividualList = [
        ...familyList.find((item) => item.id === value.id).individuals,
      ];
      familyIndividualList.forEach((item) => {
        item.name = `${item.first_name} ${item.last_name}`;
      });
      setIndividualList(familyIndividualList);
      const newValue = value.id;
      value = newValue;
    }
    const newServerParams = { ...serverParams };
    newServerParams[param] = value;
    setServerParams(newServerParams);
  };

  // create visit request
  const createVisit = async () => {
    // const isInvalidForm = validateRequiredFields();
    // if (isInvalidForm) {
    //   return
    // }
    const newServerParams = { ...serverParams };
    try {
      const res = await instance.post("/visits/", newServerParams);
      setDataSaved(true);
      navigate("/visits");
    } catch (e) {
      console.error(e);
      setErrorFn(e, setErrorOccurred, setError);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content"  dir={rtlDirection}>
        <Container fluid>
          {errorOccurred && (
            <div
              class="alert alert-danger"
              style={{ marginTop: 10 }}
              role="alert"
            >
              {error}
            </div>
          )}

          <h4 className="my-4">{t("Create Visit")}</h4>
          <div className="form-page-container">
            {/* Volunteer */}
            <div className="row mb-4">
              <div className="col-2 align-content-center">
                <p className="m-0">
                  <strong>{t("Volunteer")}</strong>
                  <span style={{ color: "red" }}> * </span>
                </p>
              </div>
              <div className='col-8'>
                <Autocomplete name="Volunteer" searchParam="name" 
                list={volunteersList.map(item=>item.individual)} 
                searchMethod={getVolunteers}
                
                 selectedObject={(value)=>{updateServerParams(value?.id, 'volunteer')}}
                 placeholder={t("Select Volunteer")}/>
              </div>
              <div className="col-2 d-flex align-items-center">
                <Link
                  to="/volunteer/new"
                  className="btn btn-primary w-100"
                  color="primary"
                >
                  <i className="fas fa-plus-circle me-1"></i>
                  {t("Create Volunteer")}
                </Link>
              </div>
            </div>
            {/* Family */}
            <div className="row mb-4">
              <div className="col-2 align-content-center">
                <p className="m-0">
                  <strong>{t("Family")}</strong>
                  <span style={{ color: "red" }}> * </span>
                </p>
              </div>
              <div className='col-8 '>
                <Autocomplete name="Family" searchParam="title_long" 
                list={familyList} 
                 selectedObject={(value)=>{updateServerParams(value, 'family_id')}}
                 searchMethod={getFamilies}
                  placeholder={t("Select Family")}/>
              </div>
              <div className="col-2">
                <Link
                  to="/individual/new"
                  className="btn btn-primary w-100"
                  color="primary"
                >
                  <i className="fas fa-plus-circle me-1"></i>
                  {t("Create Family")}
                </Link>
              </div>
            </div>
            {/* Individual */}
            <div className="row mb-4">
              <div className="col-2 align-content-center">
                <p className="m-0">
                  <strong>{t("Individual")}</strong>
                </p>
              </div>
              <div className='col-10'>
              { individualList.length ? 
              <div style={{position: "sticky"}}>
                <Autocomplete name="Individual" searchParam="name" list={individualList}  
                searchApi={false}
                selectedObject={(value)=>{updateServerParams(value?.id, 'individual_id')}}/>
              </div>
                :
                <input className="form-control" placeholder={t('Select family to view individuals')} disabled/>
                }
              </div>
            </div>
            {/* Visit Purpose */}
            <div className="row mb-4">
              <div className="col-2 align-content-center">
                <p className="m-0">
                  <strong> {t("Visit Purpose")}</strong>{" "}
                  <span style={{ color: "red" }}> * </span>
                </p>
              </div>
              <div className="col-10">
                <input
                  className="form-control"
                  type="text"
                  placeholder={t("Visit Purpose")}
                  onChange={(value) => {
                    updateServerParams(value.target.value, "visit_purpose");
                  }}
                />
              </div>
            </div>

            <Button
              color="primary"
              onClick={() => {
                createVisit();
              }}
            >
              {t("Submit")}
            </Button>
            {dataSaved && (
              <div className="alert alert-success mt-3" role="alert">
                {t("Visit saved successfully!")}
              </div>
            )}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
export default withTranslation()(CreateVisit);
