import React, { useEffect, useState, useContext } from "react";
// Components
import { Container, Row, Col, Button } from "reactstrap";
import instance from "base_url";
import { useLocation, useNavigate } from "react-router-dom"

export default function CreateFamily() {
  const navigate = useNavigate();
  const [family, setFamily] = useState([]);

  const updateServerParams = (value, param) => {
    const newFamily = { ...family };
    newFamily[param] = value;
    setFamily(newFamily);
  };

  const saveFamily = async () => {
    try {
      const res = await instance.post('/families/', family)
      navigate('/families');
    } catch (e){ 
      console.error(e)
    }
  }

  return (
    <div className="page-content">
      <Container fluid>
        <div className="page-title-box">
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <h6 className="page-title">{t("Support Type Detail Page")}</h6>
            </Col>
          </Row>

          <div className="form-page-container">
              {/* Support Type Name */}
              <div className='row mb-4'>
                <div className='col-2 align-content-center'>
                  <p className='m-0'><strong>{t("Family Title")}</strong></p>
                </div>
                <div className='col-10'>
                <input
                    className="form-control"
                    placeholder={t("Add Family Title")}
                    onChange={(value)=>{updateServerParams(value.target.value, 'title')}}
                  />
                </div>
              </div>

            {/* Actions */}
            <Button onClick={()=>{saveFamily()}}>
            {t("Create")}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
