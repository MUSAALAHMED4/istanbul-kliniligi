import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import instance from "base_url";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

export default function Autocomplete({
  name,
  searchParam,
  placeholder,
  basePlaceholder,
  list,
  selectedObject,
  isError=false,
  searchApi=true,
  searchMethod=()=>{},
}) {
  const { t } = useTranslation();
  const [singlebtn, setSinglebtn] = useState(false);
  const [searchList, setSearchList] = useState(list);
  const [selectedItem, setSelectedItem] = useState(
    placeholder ? placeholder :  `${t('Select')} ${t(name)}`
  );
  
  const [searchInput, setSearchInput] = useState(""); // Store the search input
  const ref = useRef(); // Ref to detect clicks outside

  const filterList = async (value) => {
    console.log(searchApi, "=================")
    setSearchInput(value.target.value);
    if (searchApi) {
      searchMethod(value.target.value);
    } else {
      console.log(list, searchParam, value.target.value)
      const filteredList = list.filter((item) =>
        item[searchParam]
          .toLowerCase()
          .includes(value.target.value.toLowerCase())
      );
      setSearchList(filteredList); // Update the search list based on search
    }
  };

  useEffect(() => {
    setSearchList(list); // Reset the list whenever the main list changes
  }, [list]);

  useEffect(() => {
    setSelectedItem(placeholder ? placeholder : `Select ${name}`);
  }, [placeholder]);

  // use effect to show error if isError is true
  useEffect(() => {
    if (isError) {
      ref.current.style.border = "1px solid red";
    } else {
      ref.current.style.border = "1px solid #ced4da";
    }
  }, [isError]);

  // Close the dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setSinglebtn(false);
      
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const clearSelection = () => {
    
    setSelectedItem(placeholder ? placeholder : `Select ${name}`);
    setSearchList(list);
    setSearchInput(""); // Clear the search input
    selectedObject(null); // Clear the selected object
      
  };

  return (
    <div className="" ref={ref}>
      <div className="d-flex">
        <button
          className="auto-complete-btn"
          type="button"
          onClick={() => {
            setSinglebtn(!singlebtn);
          }}
          style={isError ? {border: '1px solid red'} : {}}
        >
          {selectedItem}
        </button>
        {/* Clear button */}
        <button
          className="btn btn-sm btn-primary"
          type="button"
          onClick={clearSelection}
          style={{ marginLeft: "10px" }}
        >
          x
        </button>
      </div>
      <ul className={singlebtn ? "auto-complete-menu" : "d-none"} style={{ maxHeight: "200px", overflowY: "auto" }}>
        <li className="p-0" style={{
          position: "sticky",
          top: "0",
          backgroundColor: "white",
          zIndex: "1",
        }}>
          <input
            onChange={(e) => {
              filterList(e);
            }}
            className="form-control"
            type="text"
            value={searchInput}
            placeholder={`${t('Search a')} ${t(name)}`}
          />
        </li>
        
        {/* Show all items but with scrollable container */}
        {searchList?.map((item, index) => (
          <li
            onClick={() => {
              setSelectedItem(item[searchParam]);
              selectedObject(item);
              setSinglebtn(false);
            }}
            key={index}
            className="d-flex justify-content-between align-items-center"
          >
<span>{item[searchParam]}</span>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-${index}`}>
                  <div>
                    <strong>{t("ID")}:</strong> {item?.id || <i className="fas fa-ban" style={{ color: "red" }}></i>}
                  </div>
                  <div>
                    <strong>{t("TC")}:</strong> {item?.national_id || <i className="fas fa-ban" style={{ color: "red" }}></i>}
                  </div>
                  <div>
                    <strong>{t("Father Name")}:</strong> {item?.father_name || <i className="fas fa-ban" style={{ color: "red" }}></i>}
                  </div>
                  <div>
                    <strong>{t("Place of Birth")}:</strong> {item?.place_of_birth || <i className="fas fa-ban" style={{ color: "red" }}></i>}
                  </div>
                </Tooltip>
              }
            >
              <i className="fas fa-info-circle"></i>
            </OverlayTrigger>
          </li>
        ))}
      </ul>
    </div>
  );
}
