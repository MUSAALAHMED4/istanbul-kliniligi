import React, { useEffect, useState, useContext } from "react";
import AuthContext from "context/AuthContext";
import { Card, CardBody, CardTitle, Container, Row, Col, Button } from "reactstrap";
import instance from "base_url";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";


export default function SupportCriteriaDetails() {
  const { t } = useTranslation(); 
  const { state } = useLocation();
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [supportTypes, setSupportTypes] = useState([]);
  const [volunteersList, setVolunteersList] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [serverParams, setServerParams] = useState({ support_type: null, income_items: [], expense_items: [] });
  const [incomeTitles, setIncomeTitles] = useState([]);
  const [expenseTitles, setExpenseTitles] = useState([]);
  const [ageRanges, setAgeRanges] = useState([{ from: "", to: "", value: "" }]);
  const [isAgeChecked, setIsAgeChecked] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);

  const getSupportCriteria = async (id) => {
    console.log("Fetching support criteria...");
    try {
      const { data } = await instance.get(`/support-criteria/${id}/`);
      console.log("Support criteria data:", data);
      setServerParams({
        support_type: data.support_type,
        income_items: data.income_items,
        expense_items: data.expense_items,
        title: data.title,
        extra_info: data.extra_info,
      });
      setAgeRanges(data.extra_info?.age_criteria || [{ from: "", to: "", value: "" }]);
      if (data.extra_info && data.extra_info.age_criteria) {
        setIsAgeChecked(true);
      }
    } catch (e) {
      console.error("Error fetching support criteria:", e);
    }
  };

  const getSupportTypes = async () => {
    console.log("Fetching support types...");
    try {
      const { data } = await instance.get("/support-type/");
      console.log("Support types:", data.results);
      setSupportTypes(data.results);
    } catch (e) {
      console.error("Error fetching support types:", e);
    }
  };

  // Get Income Titles
  const getIncomeTitles = async () => {
    console.log("Fetching income titles...");
    try {
      const { data } = await instance.get("/incomes/item_titles/");
      console.log("Income titles data:", data);
      setIncomeTitles(data);
    } catch (e) {
      console.error("Error fetching income titles:", e);
    }
  };

  // Get Expense Titles
  const getExpenseTitles = async () => {
    console.log("Fetching expense titles...");
    try {
      const { data } = await instance.get("/expenses/item_titles/");
      console.log("Expense titles data:", data);
      setExpenseTitles(data);
    } catch (e) {
      console.error("Error fetching expense titles:", e);
    }
  };

  useEffect(() => {
    console.log("useEffect called");
    getSupportTypes();
    getIncomeTitles();
    getExpenseTitles();
    getSupportCriteria(id);
  }, [id]);

  const updateServerParams = (value, param, checked = false) => {
    const newServerParams = { ...serverParams };
    if (param === "income_items") {
      newServerParams[param] = checked ? [...newServerParams[param], value] : newServerParams[param].filter(item => item !== value);
    } else if (param === "expense_items") {
      newServerParams[param] = checked ? [...newServerParams[param], value] : newServerParams[param].filter(item => item !== value);
      if (value === "age" && param === "expense_items") {
        setIsAgeChecked(checked);
      }
    } else {
      newServerParams[param] = value;
    }
    setServerParams(newServerParams);
    console.log(newServerParams);
  };

  const saveSupportCriteria = async () => {
    const payload = { ...serverParams, visit: state };
    // add title to payload like support type name and 'criteria'
    payload.title = supportTypes.find(type => type.id === payload.support_type).name + " Criteria";
    payload.extra_info = JSON.stringify({ age_criteria: ageRanges });
    try {
      const res = await instance.put(`/support-criteria/${id}/`, payload); // Use PUT for updating
      setDataSaved(true);
      // return to support criteria list page after 2 seconds
      setTimeout(() => {
        navigate("/support-criteria");
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgeRangeChange = (index, field, value) => {
    const newAgeRanges = [...ageRanges];
    newAgeRanges[index][field] = value;
    setAgeRanges(newAgeRanges);
  };

  const addAgeRange = () => {
    setAgeRanges([...ageRanges, { from: "", to: "", value: "" }]);
  };

  const removeAgeRange = (index) => {
    const newAgeRanges = ageRanges.filter((_, i) => i !== index);
    setAgeRanges(newAgeRanges);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="page-title-box">
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <h6 className="page-title">{t("Support Criteria Details")}</h6>
            </Col>
          </Row>

          <div className="form-page-container">
            {isEmployee ? (
              <div>
                {/* Support Type */}
                <div className="row mb-4">
                  <div className="col-2 align-content-center">
                    <p className="m-0">
                      <strong>{t("Support Type")}</strong>
                    </p>
                  </div>
                  <div className="col-10">
                    <select
                      className="form-control form-select"
                      value={serverParams.support_type}
                      onChange={(e) => {
                        updateServerParams(Number(e.target.value), "support_type");
                      }}
                    >
                      <option value="">{t("Select Support Type")}</option>
                      {supportTypes.map((type, index) => (
                        <option key={index} value={type.id}>
                          {t(type.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Row>
                  <Col>
                    <Card>
                      <CardBody>
                        <CardTitle className="h4">{t("Income Items")}</CardTitle>
                        {incomeTitles?.map((item, index) => (
                          <Row className="mb-3" key={index}>
                            <label htmlFor="example-text-input" className="col-md-2 col-form-label">
                              {t(item.item_name)}
                            </label>
                            <div className="col-10">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  checked={serverParams.income_items.includes(item.id)}
                                  onChange={(e) => {
                                    updateServerParams(item.id, "income_items", e.target.checked);
                                  }}
                                />
                              </div>
                            </div>
                          </Row>
                        ))}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Card>
                      <CardBody>
                        <CardTitle className="h4">{t("Expense Items")}</CardTitle>
                        {expenseTitles?.map((item, index) => (
                          <div key={index}>
                            <Row className="mb-3">
                              <label htmlFor="example-text-input" className="col-md-2 col-form-label">
                              {t(item.item_name)}
                              </label>
                              <div className="col-10">
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={serverParams.expense_items.includes(item.id)}
                                    onChange={(e) => {
                                      if (item.item_name.toLowerCase() === "age") {
                                        setIsAgeChecked(e.target.checked);
                                      }
                                      updateServerParams(item.id, "expense_items", e.target.checked);
                                    }}
                                  />
                                </div>
                              </div>
                            </Row>
                            {item.item_name.toLowerCase() === "age" && isAgeChecked && (
                              <div className="ml-5">
                                {ageRanges.map((range, rangeIndex) => (
                                  <Row className="mb-3" key={rangeIndex}>
                                    <div className="col-3">
                                      <input
                                        type="number"
                                        className="form-control"
                                        placeholder={t("From")}
                                        value={range.from}
                                        onChange={(e) => handleAgeRangeChange(rangeIndex, "from", e.target.value)}
                                      />
                                    </div>
                                    <div className="col-3">
                                      <input
                                        type="number"
                                        className="form-control"
                                        placeholder={t("To")}
                                        value={range.to}
                                        onChange={(e) => handleAgeRangeChange(rangeIndex, "to", e.target.value)}
                                      />
                                    </div>
                                    <div className="col-3">
                                      <input
                                        type="number"
                                        className="form-control"
                                        placeholder={t("Value")}
                                        value={range.value}
                                        onChange={(e) => handleAgeRangeChange(rangeIndex, "value", e.target.value)}
                                      />
                                    </div>
                                    <div className="col-3">
                                      <Button color="danger" onClick={() => removeAgeRange(rangeIndex)}>
                                        -
                                      </Button>
                                    </div>
                                  </Row>
                                ))}
                                <Button color="primary" onClick={addAgeRange}>
                                  +
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <div>
                {t("Only Employees can create Support Criteria")}
              </div>
            )}

            {/* Actions */}
            <Button onClick={() => saveSupportCriteria()}>{t("Save")}</Button>
          </div>
        </div>
      </Container>
      {dataSaved && (
        <div className="alert alert-success mt-3" role="alert">
          {t("Support Criteria saved successfully!")}
        </div>
      )}
    </div>
  );
}
