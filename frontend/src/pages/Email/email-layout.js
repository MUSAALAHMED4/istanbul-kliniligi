import React from "react";
import { Container, Row, Col } from "reactstrap";
import EmailSideBar from "./email-sidebar"; // Import EmailSideBar component

const EmailLayout = ({ children, starredEmails, emailCount }) => {
  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <EmailSideBar starredEmails={starredEmails} emailCount={emailCount} />
            <div className="email-rightbar mb-3">
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmailLayout;
