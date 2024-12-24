import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Input, Label, Card } from "reactstrap";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

// Import Email Sidebar
import EmailSideBar from "./email-sidebar";

// Import Email Toolbar
import EmailToolbar from "./email-toolbar";

// Import translation hook
import { useTranslation } from 'react-i18next';

const EmailInbox = () => {
  const { t } = useTranslation();  // Hook for translation

  // Setting the document title with translation
  document.title = t("Inbox") + " | tijuana-project";

  // Retrieve starred emails from LocalStorage
  const [starredEmails, setStarredEmails] = useState(() => {
    const savedStarredEmails = localStorage.getItem("starredEmails");
    return savedStarredEmails ? JSON.parse(savedStarredEmails) : [];
  });

  const [isStarredView, setIsStarredView] = useState(false);  // State to toggle starred emails view
  const [trashedEmails, setTrashedEmails] = useState(() => {  // Retrieve trashed emails from LocalStorage
    const savedTrashedEmails = localStorage.getItem("trashedEmails");
    return savedTrashedEmails ? JSON.parse(savedTrashedEmails) : [];
  });
  const [importantEmails, setImportantEmails] = useState(() => {  // Retrieve important emails from LocalStorage
    const savedImportantEmails = localStorage.getItem("importantEmails");
    return savedImportantEmails ? JSON.parse(savedImportantEmails) : [];
  });
  const [isImportantView, setIsImportantView] = useState(false);  // State to toggle important emails view
  const [isTrashView, setIsTrashView] = useState(false);  // State to toggle trashed emails view
  const [selectedEmails, setSelectedEmails] = useState([]);  // Emails selected for deletion or important tagging

  const emails = [
    { id: "email-1", title: "Peter, me (3)", subject: "Hello", teaser: "Trip home from Colombo has been arranged...", date: "Mar 6" },
    { id: "email-2", title: "me, Susanna (7)", subject: "Freelance", teaser: "Since you asked... and i'm inconceivably bored...", date: "Mar 6" },
    { id: "email-3", title: "Web Support Dennis", subject: "Re: New mail settings", teaser: "Will you answer him asap?", date: "Mar 7" },
  ];

  // Toggle star status for an email and save to LocalStorage
  const toggleStar = (emailId) => {
    const updatedStarredEmails = starredEmails.includes(emailId)
      ? starredEmails.filter((id) => id !== emailId)
      : [...starredEmails, emailId];

    setStarredEmails(updatedStarredEmails);
    localStorage.setItem("starredEmails", JSON.stringify(updatedStarredEmails));
  };

  // Move selected emails to trash and update LocalStorage
  const moveToTrash = () => {
    const updatedTrashedEmails = [...trashedEmails, ...selectedEmails];
    setTrashedEmails(updatedTrashedEmails);
    localStorage.setItem("trashedEmails", JSON.stringify(updatedTrashedEmails));
    setSelectedEmails([]);
  };

  // Restore emails from trash and update LocalStorage
  const restoreFromTrash = () => {
    const updatedTrashedEmails = trashedEmails.filter(id => !selectedEmails.includes(id));
    setTrashedEmails(updatedTrashedEmails);
    localStorage.setItem("trashedEmails", JSON.stringify(updatedTrashedEmails));
    setSelectedEmails([]);
  };

  // Move selected emails to important and update LocalStorage
  const moveToImportant = () => {
    const updatedImportantEmails = [...importantEmails, ...selectedEmails];
    setImportantEmails(updatedImportantEmails);
    localStorage.setItem("importantEmails", JSON.stringify(updatedImportantEmails));
    setSelectedEmails([]);
  };

  // Restore emails from important and update LocalStorage
  const restoreFromImportant = () => {
    const updatedImportantEmails = importantEmails.filter(id => !selectedEmails.includes(id));
    setImportantEmails(updatedImportantEmails);
    localStorage.setItem("importantEmails", JSON.stringify(updatedImportantEmails));
    setSelectedEmails([]);
  };

  // Reset views and go back to inbox
  const showInbox = () => {
    setIsStarredView(false);
    setIsTrashView(false);
    setIsImportantView(false);
  };

  // Handle email selection for deletion or important tagging
  const toggleEmailSelection = (emailId) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  // Filter emails based on current view (Inbox, Starred, Trash, Important)
  const displayedEmails = isTrashView
    ? emails.filter(email => trashedEmails.includes(email.id))  // Show trashed emails
    : isImportantView
      ? emails.filter(email => importantEmails.includes(email.id))  // Show important emails
      : isStarredView
        ? emails.filter(email => starredEmails.includes(email.id))  // Show starred emails
        : emails.filter(email => !trashedEmails.includes(email.id));  // Show regular inbox emails

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs with translation */}
          <Breadcrumbs 
            maintitle="tijuana" 
            title={t("Email")} 
            breadcrumbItem={isTrashView ? t("Trash") : isImportantView ? t("Important Emails") : isStarredView ? t("Starred Emails") : t("Inbox")} 
          />

          <Row>
            <Col xs="12">
              {/* Pass state setters to EmailSideBar for managing views */}
              <EmailSideBar 
                starredEmails={starredEmails} 
                emailCount={emails.length}
                setIsStarredView={setIsStarredView} 
                setIsTrashView={setIsTrashView}
                setIsImportantView={setIsImportantView} 
              />
              <div className="email-rightbar mb-3">
                <Card>
                  {/* Pass move and restore functions to EmailToolbar based on view */}
                  <EmailToolbar 
                    moveToTrash={moveToTrash} 
                    restoreFromTrash={restoreFromTrash} 
                    moveToImportant={moveToImportant} 
                    restoreFromImportant={restoreFromImportant} 
                    isTrashView={isTrashView} 
                    isImportantView={isImportantView} 
                    showInbox={showInbox} 
                  />

                  <ul className="message-list">
                    {displayedEmails.length > 0 ? (
                      displayedEmails.map((email) => (
                        <li key={email.id}>
                          <div className="col-mail col-mail-1">
                            <div className="checkbox-wrapper-mail">
                              {/* Handle email selection for trash or important */}
                              <Input
                                type="checkbox"
                                id={`chk-${email.id}`}
                                onChange={() => toggleEmailSelection(email.id)}
                              />
                              <Label htmlFor={`chk-${email.id}`} className="toggle" />
                            </div>
                            <Link to={`/email-read/${email.id}`} className="title">
                              {email.title}
                            </Link>
                            <span
                              className={`star-toggle ${starredEmails.includes(email.id) ? "fas fa-star" : "far fa-star"}`}
                              onClick={() => toggleStar(email.id)}
                            />
                          </div>
                          <div className="col-mail col-mail-2">
                            <Link to={`/email-read/${email.id}`} className="subject">
                              {email.subject} – <span className="teaser">{email.teaser}</span>
                            </Link>
                            <div className="date">{email.date}</div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p>{t("No emails to display.")}</p>
                    )}
                  </ul>
                </Card>
                <Row>
                  <Col xs="7">{t("Showing")} 1 - {displayedEmails.length} {t("of")} {emails.length}</Col>
                  <Col xs="5">
                    <div className="btn-group float-end">
                      <Button type="button" color="success" size="sm" className="waves-effect">
                        <i className="fa fa-chevron-left" />
                      </Button>
                      <Button type="button" color="success" size="sm" className="waves-effect">
                        <i className="fa fa-chevron-right" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EmailInbox;
