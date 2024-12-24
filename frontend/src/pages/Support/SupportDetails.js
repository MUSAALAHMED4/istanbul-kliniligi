import React, { useEffect, useState, useContext } from "react";
import AuthContext from "context/AuthContext";

// Components
import Autocomplete from "components/Common/Autocomplete";
import { Container, Row, Col, Button } from "reactstrap";
import instance from "base_url";
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next";
import { setErrorFn } from "../Utility/Functions";
import { set } from "lodash";

export default function CreateSupport() {
  const { state } = useLocation()
  const {id} = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [supportTypes, setSupportTypes] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [familyList , setFamilyList] = useState([])
  const [serverParams, setServerParams] = useState({});
  const [support, setSupport] = useState({});
  const [requestStatues, setRequestStatues] = useState(null)
  const [errorOccurred, setErrorOccurred] = useState(false)
  const [error, setError] = useState("An Error Occurred")

  const visitId =
    new URLSearchParams(window.location.search).get("visit") || null;

  // Get Support Details
  const getSupportDetails = async () => {
    try {
      const { data } = await instance.get(`/support/${id}/`)
      setSupport(data)
      console.log(data)
    } catch (e) {
      console.error(e)
      setErrorFn(e, setErrorOccurred, setError)
    }
  }


  // Get Support Type
  const getSupportTypes = async () => {
    try {
      const { data } = await instance.get("/support-type/");
      setSupportTypes(data.results);
    } catch (e) {
      console.error(e);
      setErrorFn(e, setErrorOccurred, setError)
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
      setErrorFn(e, setErrorOccurred, setError)
    }
  };

  // get Families
  const getFamilies = async (search)=>{
    try{
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
  }

  useEffect(() => {
    getSupportDetails();
    getSupportTypes();
    getVolunteers();
    getFamilies();
  }, []);

  const updateServerParams = (value, param) => {
    const newServerParams = { ...serverParams };
    newServerParams[param] = value;
    setServerParams(newServerParams);
    console.log(newServerParams)
  };

  const saveSupport = async ()=>{
    try{
      const res = await instance.put(`/support/${id}/`, serverParams)
      setRequestStatues({
        status: "success",
        text: t("Support Updated!"),
      })
      setTimeout(()=>{
        setRequestStatues(null)
        navigate(`/visit/${visitId}`)
      },2000)
    }catch (e){
      console.error(e)
      // setRequestStatues({
      //   status: "danger",
      //   text: t("An Error Occurred!"),
      // })
      setErrorFn(e, setErrorOccurred, setError)
    }
  }

  return (
    <div className="page-content">
      <Container fluid>
      {
          errorOccurred &&
          <div class="alert alert-danger" style={{marginTop: 10}} role="alert">
           {error}
          </div>
        }
        <div className="page-title-box">
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <h4 className="my-4">{t("Support Details for visit:")}{support.visit_str}</h4>
            </Col>
          </Row>

          <div className="form-page-container">
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
                    value={support.support_type?.id}
                    onChange={(e) => {
                      updateServerParams(Number(e.target.value), "support_type");
                    }}
                  >
                    <option>{t("Select Support Type")}</option>
                    {supportTypes.map((type, index) => (
                      <option key={index} value={type.id}>{type.name}</option>
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
                  <Autocomplete
                    name="Volunteer"
                    searchMethod={getVolunteers}
                    searchParam="name"
                    placeholder={support.volunteer?.name}
                    list={volunteersList.map((item) => item.individual)}
                    selectedObject={(value) => {
                      updateServerParams(value?.id, "volunteer");
                    }}
                  />
                </div>
              </div>

              {/* Family */}
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Family")}</strong></p>
                </div>
                <div className='col-10 '>
                <Autocomplete 
                  name="Family" 
                  searchMethod={getFamilies}
                  searchParam="title" 
                  list={familyList}  
                  placeholder={support.family?.title}
                  selectedObject={(value)=>{updateServerParams(value?.id, 'family_id')}}/>
                </div>
              </div>

              {/* Individual */}
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Individual")}</strong></p>
                </div>
                <div className='col-10'>
                {familyList.length ? (
                    <Autocomplete 
                      name="Individual" 
                      searchParam="name"
                      searchApi={false}
                      list={familyList[0].individuals}  
                      placeholder={support.individual?.name}
                      selectedObject={(value)=>{updateServerParams(value?.id, 'individual')}}/>
                  ) : (
                    <input
                      className="form-control"
                      placeholder={t("Select Family First!")}
                      readOnly
                    />
                  )}
                </div>
              </div>

              {/* frequency */}
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Frequency")}</strong></p>
                </div>
                <div className='col-10'>
                <select value={support.frequency} className="form-control form-select" onChange={(value)=>{updateServerParams(value.target.value, 'frequency')}}>
                  <option>{t("Select Frequency")}</option>
                  <option value="once">{t("Once")}</option>
                  <option value="daily">{t("Daily")}</option>
                  <option value="weekly">{t("Weekly")}</option>
                  <option value="monthly">{t("Monthly")}</option>
                </select>
                </div>
              </div>

              {/* Visit Notes */}
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Notes")}</strong></p>
                </div>
                <div className='col-10'>
                <textarea id="notes" name="notes" className="form-control" maxLength="225" rows="5" placeholder={support.notes ? support.notes : t("Add notes about the support")} onChange={(value) => { updateServerParams(value.target.value, 'notes'); }}></textarea>
                </div>
              </div>
            </div>
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Volunteer Notes")}</strong></p>
                </div>
                <div className='col-10'>
                <textarea disabled id="notes" name="notes" className="form-control" maxLength="225" rows="5" placeholder={support.volunteer_notes ? support.volunteer_notes : t("N/A")} onChange={(value) => { updateServerParams(value.target.value, 'volunteer_notes'); }}></textarea>
                </div>
              </div>
            
            {/* Actions */}
            <Button onClick={()=>{saveSupport()}}>
            {t("Save")}
            </Button>
          </div>
          {
              requestStatues && 
              <div class={`mt-3 alert alert-${requestStatues.status}`} role="alert">
                {requestStatues.text}
              </div>
            }
        </div>
      </Container>
    </div>
  );
}
