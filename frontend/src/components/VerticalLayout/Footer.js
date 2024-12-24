import React from "react"
import { Container, Row, Col } from "reactstrap"
import { useTranslation } from "react-i18next";


const Footer = () => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid={true}>
          <Row>
            <div className="col-12">
              © {new Date().getFullYear()}  {t("Tijuana")}<span className="d-none d-sm-inline-block"> - {t("Crafted with")}
              {" "}<i className="mdi mdi-heart text-danger"></i>  {t("by TzuChi Turkiye")}</span>
            </div>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  )
}

export default Footer
