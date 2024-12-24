import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import instance from "base_url";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import "chartist/dist/scss/chartist.scss";
import moment from "moment";

//i18n
import { withTranslation } from "react-i18next";

const Dashboard = (props) => {
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [dashboardData, setDashboardData] = useState({});
  const isRTL = document.documentElement.dir === "rtl";
  const [rtlDirection, setRtlDirection] = useState("ltr");

  document.title = "Dashboard | istanbul-klinileri";

  // Set RTL direction
  useEffect(() => {
    setRtlDirection(props.i18n.language === "ar" ? "rtl" : "ltr");
  }, [props.i18n.language]);

  const getAllData = async () => {
    try {
      const dashboardData = await instance.get("/dashboard/stats/");
      // console log requested url
      console.log(dashboardData.config.url);
      setDashboardData(dashboardData.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  console.log(dashboardData);

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center">
              <Col md={8}>
                <h6 className="page-title">{props.t("Dashboard")}</h6>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item active">
                    {props.t("Welcome to")}{" "}
                    <strong>{props.t("Tzu Chi Foundation")}</strong>{" "}
                    {props.t("Dashboard")}
                  </li>
                </ol>
              </Col>
            </Row>
          </div>

          {/* Homepage Content | WILL BE VISABLE ONLY FOR EMPLOYEES */}
          {isEmployee ? (
            <div>
              <Row>
                <Col xl={3} md={6}>
                  <Card className="mini-stat bg-primary text-white">
                    <CardBody>
                      <div className="mb-4">
                        <div className="float-start mini-stat-img me-4">
                          <i className="ti-calendar h3"></i>
                        </div>
                        <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                          {props.t("Visits")}
                        </h5>
                        <h4 className="fw-medium font-size-24">
                          {dashboardData?.visit_count}
                        </h4>
                      </div>
                      <div className="pt-2">
                        <div className="float-end d-flex align-items-center">
                          <Link to="/visits" className="text-white-50 h5">
                            {props.t("More Details")}
                            <i
                              className={`mdi mdi-arrow-${props.i18n.language === "ar" ? "left" : "right"} ms-2`}
                            ></i>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={3} md={6}>
                  <Card className="mini-stat bg-primary text-white">
                    <CardBody>
                      <div className="mb-4">
                        <div className="float-start mini-stat-img me-4">
                          <i className="mdi mdi-human-male-child h3"></i>
                        </div>
                        <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                          {props.t("Families")}
                        </h5>
                        <h4 className="fw-medium font-size-24">
                          {dashboardData?.family_count}{" "}
                        </h4>
                      </div>
                      <div className="pt-2">
                        <div className="float-end d-flex align-items-center">
                          <Link to="/families" className="text-white-50 h5">
                            {props.t("More Details")}
                            <i
                              className={`mdi mdi-arrow-${props.i18n.language === "ar" ? "left" : "right"} ms-2`}
                            ></i>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={3} md={6}>
                  <Card className="mini-stat bg-primary text-white">
                    <CardBody>
                      <div className="mb-4">
                        <div className="float-start mini-stat-img me-4">
                          <i className="fas fa-user-edit h3"></i>
                        </div>
                        <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                          {props.t("Volunteers")}
                        </h5>
                        <h4 className="fw-medium font-size-24">
                          {dashboardData?.volunteer_count}
                        </h4>
                      </div>
                      <div className="pt-2">
                        <div className="float-end d-flex align-items-center">
                          <Link to="/volunteers" className="text-white-50 h5">
                            {props.t("More Details")}
                            <i
                              className={`mdi mdi-arrow-${props.i18n.language === "ar" ? "left" : "right"} ms-2`}
                            ></i>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={3} md={6}>
                  <Card className="mini-stat bg-primary text-white">
                    <CardBody>
                      <div className="mb-4">
                        <div className="float-start mini-stat-img me-4">
                          <i className="fas fa-hand-holding-heart h3"></i>
                        </div>
                        <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                          {props.t("Support Type")}
                        </h5>
                        <h4 className="fw-medium font-size-24">
                          {dashboardData?.support_type_count}
                        </h4>
                      </div>
                      <div className="pt-2">
                        <div className="float-end d-flex align-items-center">
                          <Link
                            to="/support-types/"
                            className="text-white-50 h5"
                          >
                            {props.t("More Details")}
                            <i
                              className={`mdi mdi-arrow-${props.i18n.language === "ar" ? "left" : "right"
                                } ms-2`}
                            ></i>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col md={9}>
                  <Card>
                    <CardBody>
                      <h4 className="card-title mb-4">
                        {props.t("Pending Visits")}
                      </h4>
                      <ol className="activity-feed">
                        {dashboardData?.pending_visits?.map((visit, index) => (
                          <li className="feed-item" key={index}>
                            <div className="feed-item-list">
                              <span className="date">
                                <strong>{props.t("Visit Date")}:</strong>{" "}
                                {moment(visit.visit_date).format("YYYY.MM.DD")}
                              </span>
                              <span className="activity-text">
                                <strong>{props.t("Family")}:</strong>{" "}
                                {visit.family.title}
                              </span>
                              <p className="activity-text m-0">
                                <strong>{props.t("Volunteer")}::</strong>{" "}
                                {visit.volunteer_name}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="text-center">
                        <Link to="/visits" className="btn btn-primary">
                          {props.t("See More")}
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-primary">
                    <CardBody>
                      <div className="text-center text-white py-4">
                        <h5 className="mt-0 mb-4 text-white-50 font-size-16">
                          {props.t("Successfully Completed Visits")}
                        </h5>
                        <h1>{dashboardData?.completed_visits}</h1>
                        <p className="font-size-18 pt-1">{props.t("Visit")}</p>
                        <p className="text-white-50 mb-0"></p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <></>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
  i18n: PropTypes.any,
};

export default withTranslation()(Dashboard);
