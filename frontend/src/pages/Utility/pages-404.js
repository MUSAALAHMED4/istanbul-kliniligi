import React from "react";
import { Link } from "react-router-dom";
import { Container, Card, CardBody, Row, Col } from "reactstrap";
import { useTranslation } from "react-i18next";



//Import Images
import errorImg from "../../assets/images/error.png";

const Pages404 = () => {
  const { t } = useTranslation();
  document.title = t("404 Error Page");
  return (
    <React.Fragment>
      <div className="authentication-bg d-flex align-items-center pb-0 vh-100">
        <div className="content-center w-100">
          <Container>
            <Row className="justify-content-center">
              <Col xl={10}>
                <Card>
                  <CardBody>
                    <Row className="align-items-center">
                      <Col lg={4} className="ms-auto">
                        <div className="ex-page-content">
                          <h1 className="text-dark display-1 mt-4">404!</h1>
                          <h4 className="mb-4">{t("Sorry, page not found")}</h4>
                          <Link className="btn btn-primary mb-5 waves-effect waves-light" to="/"><i className="mdi mdi-home"></i>{t("Back to Dashboard")}</Link>
                        </div>
                      </Col>
                      <Col lg={5} className="mx-auto">
                        <img
                          src={errorImg}
                          alt=""
                          className="img-fluid mx-auto d-block"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pages404;