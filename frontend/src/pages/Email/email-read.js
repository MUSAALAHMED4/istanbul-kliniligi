import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody } from "reactstrap";

// Import Image
import avatar2 from "../../assets/images/users/user-2.jpg";
import img3 from "../../assets/images/small/img-3.jpg";
import img4 from "../../assets/images/small/img-4.jpg";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

// Import EmailLayout 
import EmailLayout from "./email-layout";

// i18n
import { useTranslation } from 'react-i18next';

const EmailRead = () => {
  const { t } = useTranslation();
  
  document.title = t("Read Email") + " | Veltrix - React Admin & Dashboard Template";

  const emails = [
    { id: "email-1", sender: "Humberto D. Champion", subject: t("This Week's Top Stories"), content: t("Praesent dui ex..."), email: "support@domain.com" },
    { id: "email-2", sender: "Susanna", subject: t("Freelance Project"), content: t("Since you asked..."), email: "susanna@domain.com" },
    { id: "email-3", sender: "Web Support Dennis", subject: t("New mail settings"), content: t("Will you answer him asap?"), email: "support@domain.com" }
  ];

  const email = emails.find(e => e.id === "email-1");  
  return (
    <EmailLayout starredEmails={[]} emailCount={emails.length}>
      <Breadcrumbs maintitle={t("Veltrix")} title={t("Email")} breadcrumbItem={t("Read Email")} />

      <Card>
        <CardBody>
          {email ? (
            <>
              <div className="d-flex mb-4">
                <img className="me-3 rounded-circle avatar-sm" src={avatar2} alt={t("User Avatar")} />
                <div className="flex-1">
                  <h5 className="font-size-15 m-0">{email.sender}</h5>
                  <small className="text-muted">{email.email}</small>
                </div>
              </div>

              <h4 className="mt-0 font-size-16">{email.subject}</h4>
              <p>{email.content}</p>

              <hr />
              <Row>
                <Col xl="2" xs="6">
                  <Card>
                    <img className="card-img-top img-fluid" src={img3} alt={t("Attachment")} />
                    <div className="py-2 text-center">
                      <Link to="#" className="fw-medium">{t("Download")}</Link>
                    </div>
                  </Card>
                </Col>
                <Col xl="2" xs="6">
                  <Card>
                    <img className="card-img-top img-fluid" src={img4} alt={t("Attachment")} />
                    <div className="py-2 text-center">
                      <Link to="#" className="fw-medium">{t("Download")}</Link>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Link to="#" className="btn btn-secondary waves-effect mt-4">
                <i className="mdi mdi-reply"></i> {t("Reply")}
              </Link>
            </>
          ) : (
            <p>{t("Email not found.")}</p>
          )}
        </CardBody>
      </Card>
    </EmailLayout>
  );
};

export default EmailRead;
