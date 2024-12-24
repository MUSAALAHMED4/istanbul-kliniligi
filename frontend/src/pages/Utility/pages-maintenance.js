import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Row, Col } from "reactstrap";

//Import Images
import maintenanceImg from "../../assets/images/maintenance.png";
import logoDark from "../../assets/images/logo-dark.png";

const PagesMaintenance = () => {
  document.title = "Maintenance | Veltrix - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="fas fa-home h2"></i>
        </Link>
      </div>

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
                    alt=""
                    className="img-fluid mx-auto d-block"
                  />
                </div>
                <h3 className="mt-4">Site is Under Maintenance</h3>
                <p>Please check back in sometime.</p>

                <Row>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-airplane-takeoff h2"></i>
                        <h6 className="text-uppercase mt-3">
                          Why is the Site Down?
                        </h6>
                        <p className="text-muted mt-3">
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-clock-alert h2"></i>
                        <h6 className="text-uppercase mt-3">
                          What is the Downtime?
                        </h6>
                        <p className="text-muted mt-3">
                          
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="text-center">
                    <Card className="mt-4 maintenance-box">
                      <CardBody>
                        <i className="mdi mdi-email h2"></i>
                        <h6 className="text-uppercase mt-3">
                          Do you need Support?
                        </h6>
                        <p className="text-muted mt-3">
                           {" "}
                          <Link
                            to="mailto:no-reply@domain.com"
                            className="text-decoration-underline"
                          >
                            no-reply@domain.com
                          </Link>
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>
          </Row>
        </div>
      </section>

    </React.Fragment>
  );
};

export default PagesMaintenance;
