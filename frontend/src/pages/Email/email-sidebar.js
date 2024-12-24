import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
} from "reactstrap";

// Import Editor
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// i18n
import { useTranslation } from "react-i18next";

const EmailSideBar = ({
  starredEmails = [],
  emailCount = 0,
  setIsStarredView,
  setIsTrashView,
  setIsImportantView,  
}) => {
  const validStarredEmails = Array.isArray(starredEmails) ? starredEmails : [];
  const [modal, setmodal] = useState(false);
  const { t } = useTranslation();

  const location = useLocation();
  const isInboxActive = location.pathname === "/email-inbox";

  return (
    <React.Fragment>
      <Card className="email-leftbar">
        {/* Button for composing a new email */}
        <Link to="/email-compose" className="btn btn-danger rounded btn-custom">
          {t("Compose")} {/* Translate "Compose" */}
        </Link>

        <div className="mail-list mt-4">
          {/* Inbox Link */}
          <Link
            to="/email-inbox"
            className={isInboxActive ? "active" : ""}
            onClick={() => { setIsStarredView(false); setIsTrashView(false); setIsImportantView(false); }}  
          >
            {t("Inbox")} <span className="ms-1">({emailCount})</span> {/* Translate "Inbox" */}
          </Link>

          <Link to="#" onClick={() => { setIsStarredView(true); setIsTrashView(false); setIsImportantView(false); }}>
            {t("Starred")} <span className="ms-1">({validStarredEmails.length})</span> {/* Translate "Starred" */}
          </Link>

          <Link to="#" onClick={() => { setIsImportantView(true); setIsStarredView(false); setIsTrashView(false); }}>   
            {t("Important")} 
          </Link>

      
          <Link to="#">{t("Draft")}</Link>

           <Link to="#">{t("Sent Mail")}</Link>

          <Link to="#" onClick={() => { setIsTrashView(true); setIsStarredView(false); setIsImportantView(false); }}>
            {t("Trash")} 
          </Link>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default EmailSideBar;
