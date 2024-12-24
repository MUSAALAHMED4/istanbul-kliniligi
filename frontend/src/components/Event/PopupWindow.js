import React, { useState } from 'react';
import './PopupWindow.css'; 
import { withTranslation } from "react-i18next";

const PopupWindow = ({ title, list, onClose, t }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredList = list.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overcard">
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>x</button>
      </div>
      <div className="search-bar">
        <form className="form relative">
          <div className="input-container">
            <input 
              type="text" 
              className="input" 
              placeholder={t("Search")} 
              value={searchTerm} 
              onChange={handleSearchChange} 
            />
             <i className="fa fa-search search-icon" aria-hidden="true"></i>
          </div>
        </form>
      </div>
      <ul className="list scrollable-list">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <li key={index}>{item}</li>
          ))
        ) : (
          <li className="no-result">{t("No results found")}</li>
        )}
      </ul>
    </div>
  );
};

export default withTranslation()(PopupWindow);
