import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Tilt from "react-parallax-tilt";
 import homeLogo from "../../assets/images/logo-dark.png";
import myImg from "../../assets/images/bg.jpg";
import Header from "../../components/HorizontalLayout/Header";
import CreateOrEditIndividual from "../Individuals/createOrEditIndividual";
import { useTranslation } from "react-i18next";

import "./home.css";

function Home() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
     const direction = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Section 1 */}
      <section
        style={{
          marginTop: "8rem",
          paddingTop: "2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Container fluid className="home-section" id="home">
          <Container className="home-content">
            <Row className="align-items-center">
              <Col md={6} className="home-header">
                <h1
                  style={{ paddingBottom: 0 }}
                  className="heading text-primary"
                >
                  {t("Welcome to")}{" "}
                  <span className="text-success">{t("Our Medical Clinic")}</span>
                </h1>

                <h2 className="heading-name">
                  <strong className="main-name text-secondary">
                    {t("Providing the Best Healthcare Services")}
                  </strong>
                </h2>
              </Col>
              <Col md={6} style={{ paddingBottom: 90 }}>
                <img
                  src={homeLogo}
                  alt={t("Clinic Logo")}
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: "450px" }}
                />
              </Col>
            </Row>
          </Container>
        </Container>
      </section>

      {/* Appointment Section */}
      <div className="appointment-section">
        <h2 className="appointment-title" style={{ textAlign: "center" }}>
          <span className="text-success">{t("Book")}</span>{" "}
          {t("a New Appointment")}
        </h2>
        <CreateOrEditIndividual />
      </div>

      {/* Services Section */}
      <section style={{ backgroundColor: "#ffffff", padding: "4rem 0" }}>
        <Container fluid className="home-about-section" id="about">
          <Container>
            <h2
              style={{
                fontSize: "2.4em",
                color: "#0d6efd",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              <span className="text-success">{t("Our")}</span> {t("Services")}
            </h2>
            <Row className="align-items-center">
              <Col md={8} className="home-about-description">
                <p
                  className="home-about-body"
                  style={{ color: "#495057", fontSize: "1.2rem" }}
                >
                  {t(
                    "We are dedicated to providing the highest quality healthcare services."
                  )}
                  <br />
                  <br /> {t("Our services include:")}
                  <i>
                    <b className="text-secondary">
                      {t(
                        "Medical consultations, laboratory tests, and family medicine."
                      )}
                    </b>
                  </i>
                  <br />
                  <br />
                  {t("We believe in using cutting-edge technology in:")}
                  <i>
                    <b className="text-secondary">{t("preventive medicine")}</b>{" "}
                    {t("and other areas such as")}{" "}
                    <b className="text-secondary">{t("home healthcare.")}</b>
                  </i>
                  <br />
                  <br />
                  {t(
                    "Contact us to receive the best medical care provided by our expert team."
                  )}
                </p>
              </Col>
              <Col md={4} className="myAvtar">
                <Tilt>
                  <img
                    src={myImg}
                    className="img-fluid rounded shadow"
                    alt={t("Clinic Background")}
                  />
                </Tilt>
              </Col>
            </Row>
          </Container>
        </Container>
      </section>
    </div>
  );
}

export default Home;
