import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Row, Col, Button } from "reactstrap";

//Import Images
import maintenanceImg from "../../assets/images/maintenance.png";
import logoDark from "../../assets/images/logo-dark.png";

const PagesError = ({ t, retryFunction }) => {
  document.title = "Error | Application";

  return (
    <React.Fragment>
      <section className="my-5">
        <div className="container-alt container">
          <Row className="justify-content-center">
            <div className="col-10 text-center">
              <div className="home-wrapper mt-5">
                <div className="mb-4">
                  <img src={logoDark} alt="logo" height="22" />
                </div>

                <div className="maintenance-img">
                  <img
                    src={maintenanceImg}
                    alt="Error"
                    className="img-fluid mx-auto d-block"
                  />
                </div>
                <h3 className="mt-4">{t("Sorry, something went wrong")}</h3>
                <p>{t("Steps to resolve the issue")}</p>

                <Row>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-wifi-off h2"></i>
                        <h6 className="text-uppercase mt-3">
                          {t("Check your internet connection")}
                        </h6>
                        <p className="text-muted mt-3">
                          {t(
                            "Ensure that your device is connected to the internet and try again."
                          )}
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-logout h2"></i>
                        <h6 className="text-uppercase mt-3">
                          {t("Log out and log back in")}
                        </h6>
                        <p className="text-muted mt-3">
                          {t(
                            "Sometimes, re-authenticating can help resolve the issue. Please log out and log back in."
                          )}
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-phone h2"></i>
                        <h6 className="text-uppercase mt-3">
                          {t("Contact the administrator")}
                        </h6>
                        <p className="text-muted mt-3">
                          {t(
                            "If you believe this is an error, please contact the administrator for assistance."
                          )}
                          <br />
                          <Link
                            // to="mailto:support@domain.com"
                            className="text-decoration-underline"
                          >
                            support@domain.com
                          </Link>
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <div className="mt-5">
                  <Button
                    onClick={retryFunction}
                    color="primary"
                    className="btn-lg"
                    style={{
                      borderRadius: "30px",
                      padding: "10px 30px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Try Again")}
                  </Button>
                </div>
              </div>
            </div>
          </Row>
        </div>
      </section>
    </React.Fragment>
  );
};

export default PagesError;