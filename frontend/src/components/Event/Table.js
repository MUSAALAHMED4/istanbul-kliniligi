import React from 'react';
import './Table.css'; 
import { useTranslation } from 'react-i18next';


const Table = ({ tableNumber, toggleFamilies, toggleVolunteers }) => {
  const { t } = useTranslation();

  return (
    <div className="event-table">
      <div className="custom-button" onClick={toggleFamilies}>
      <i className="mdi mdi-human-male-child"></i>
        <div className="tooltip">{t("Show Families")}</div>
      </div>
      <span className="table-number">{tableNumber}</span>
      <div className="custom-button" onClick={toggleVolunteers}>
        <i className="fa fa-users" aria-hidden="true"></i>
        <div className="tooltip">{t("Show Volunteers")}</div>
      </div>
    </div>
  );
};

export default Table;
