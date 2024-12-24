import React, { useState } from "react";
import { Button } from "reactstrap";
import { useTranslation } from "react-i18next";

const EmailToolbar = ({ moveToTrash, restoreFromTrash, moveToImportant, restoreFromImportant, isTrashView, isImportantView, showInbox }) => {
  const [folder_Menu, setfolder_Menu] = useState(false);
  const [tag_Menu, settag_Menu] = useState(false);
  const [more_Menu, setmore_Menu] = useState(false);
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <React.Fragment>
      <div className="btn-toolbar p-3" role="toolbar">
        <div className="btn-group me-2 mb-2 mb-sm-0">
          {/* Button to switch back to Inbox */}
          <Button
            type="button"
            color="primary"
            className="waves-light waves-effect"
            onClick={showInbox}
          >
            <i className="fa fa-inbox" /> {t("Inbox")} {/* Translated */}
          </Button>

          {/* Button to either move to important or restore from important based on the current view */}
          <Button
            type="button"
            color="primary"
            className="waves-light waves-effect"
            onClick={isImportantView ? restoreFromImportant : moveToImportant}
          >
            {isImportantView ? <i className="fa fa-undo" /> : <i className="fa fa-exclamation-circle" />}
            {isImportantView ? t("Restore") : t("Important")} {/* Translated */}
          </Button>

          {/* Button to either move to trash or restore from trash based on the current view */}
          <Button
            type="button"
            color="primary"
            className="waves-light waves-effect"
            onClick={isTrashView ? restoreFromTrash : moveToTrash}
          >
            {isTrashView ? <i className="fa fa-undo" /> : <i className="fa fa-trash-alt" />}
            {isTrashView ? t("Restore") : t("Trash")} {/* Translated */}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default EmailToolbar;
