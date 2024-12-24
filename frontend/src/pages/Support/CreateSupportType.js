import React, { useEffect, useState, useContext } from "react";
// Components
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardTitle,
  TabContent,
  TabPane,
} from "reactstrap";
import instance from "base_url";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { NavItem, NavLink } from "reactstrap";
import { useTranslation } from "react-i18next";
import CreateSupportCriteria from "./CreateSupportCriteria";
 






// Create Support Type
export default function CreateSupportType() {
  const { t , i18n } = useTranslation();
  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";
  const navigate = useNavigate();
  const { state } = useLocation();
  const [supportType, setSupportType] = useState([]);
  const [errorFields, setErrorFields] = useState([]);
  const [incomeTitles, setIncomeTitles] = useState([]);
  


  
  // Get Support Type Details
  const getSupportTypeDetais = async () => {
    try {
      const { data } = await instance.get(`/support-type/${state}/`);
      setSupportType(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (state) {
      getSupportTypeDetais();
    }
  }, []);

  const updateServerParams = (value, param) => {
    const newSupportType = { ...supportType };
    newSupportType[param] = value;
    setSupportType(newSupportType);
    console.log(newSupportType);
  };

  const saveSupport = async () => {
    try {
      const res = (await state)
        ? instance.put(`/support-type/${state}/`, supportType)
        : instance.post("/support-type/", supportType);
      navigate("/support-types");
    } catch (e) {
      console.error(e);
    }
  };

  // Tabs
  const [activeTab, setActiveTab] = useState(1);
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  // Fields Mapping
  const fields_tabs_mapping = {
    1: ["name", "amount", "targetCategory", "description"],
  };

  return (
    <div className="page-content" dir={rtlDirection}>
      <Container fluid>
        <div className="page-title-box">
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <h6 className="page-title">{t("Support Type Detail Page")}</h6>
            </Col>
          </Row>
          {/* Navigation Tabs */}
          <div
            className="form-wizard-wrapper wizard clearfix"
            style={{ marginBottom: "20px",
             }}
           
          >
            <div className="steps clearfix ">
              <ul>
                {/*Create support */}
                <NavItem className={activeTab === 1 ? "current" : ""}>
                  <NavLink onClick={() => toggleTab(1)}>
                    <span
                      className="number"
                      style={{
                        border: errorFields.some((x) =>
                          fields_tabs_mapping[1].includes(x)
                        )
                          ? "1px solid red"
                          : "1px solid #ced4da",
                        backgroundColor: errorFields.some((x) =>
                          fields_tabs_mapping[1].includes(x)
                        )
                          ? "red"
                          : "inherit",
                        color: errorFields.some((x) =>
                          fields_tabs_mapping[1].includes(x)
                        )
                          ? "white"
                          : "inherit",
                        borderRadius: "50%",
                        padding: "5px 10px",
                        marginInlineEnd: rtlDirection === "rtl" ? "10px" : "0",
                      }}
                    >
                      1.
                    </span>
                    <span
                      style={{
                        color: errorFields.some((x) =>
                          fields_tabs_mapping[1].includes(x)
                        )
                          ? "red"
                          : "inherit",
                      }}
                    >
                      {t("Create support")}
                    </span>
                  </NavLink>
                </NavItem>
                {/* Support Criteria*/}
                <NavItem className={activeTab === 2 ? "current" : ""}>
                  <NavLink onClick={() => toggleTab(2)}>
                    <span
                      className="number"
                      style={{
                        border: errorFields.some((x) =>
                          fields_tabs_mapping[2].includes(x)
                        )
                          ? "1px solid red"
                          : "1px solid #ced4da",
                        backgroundColor: errorFields.some((x) =>
                          fields_tabs_mapping[2].includes(x)
                        )
                          ? "red"
                          : "inherit",
                        color: errorFields.some((x) =>
                          fields_tabs_mapping[2].includes(x)
                        )
                          ? "white"
                          : "inherit",
                        borderRadius: "50%",
                        padding: "5px 10px",
                        marginInlineEnd: rtlDirection === "rtl" ? "10px" : "0",

                      }}
                    >
                      2.
                    </span>
                    <span
                      style={{
                        color: errorFields.some((x) =>
                          fields_tabs_mapping[2].includes(x)
                        )
                          ? "red"
                          : "inherit",
                      }}
                    >
                      {t("Support Criteria")}
                    </span>
                  </NavLink>
                </NavItem>
              </ul>
            </div>
          </div>

          {/* Tab Content */}
          <Col sm="12">
            <Card>
              <CardBody>
                <Row className="align-items-center mb-8"></Row>
                <TabContent activeTab={activeTab} className="body">
                  {/* Additional Income */}
                  <TabPane tabId={1}>
                    {/* Support Type Name */}
                    <div className="row mb-4">
                      <div className="col-2 align-content-center">
                        <p className="m-0">
                          <strong>{t("Support Type Name")}</strong>
                        </p>
                      </div>
                      <div className="col-10">
                        <input
                          className="form-control"
                          placeholder={
                            supportType
                              ? supportType.name
                              : t("Support type name")
                          }
                          onChange={(value) => {
                            updateServerParams(value.target.value, "name");
                          }}
                        />
                      </div>
                    </div>

                    {/* Support Type Amount */}
                    <div className="row mb-4">
                      <div className="col-2 align-content-center">
                        <p className="m-0">
                          <strong>{t("Support Amount")}</strong>
                        </p>
                      </div>
                      <div className="col-10">
                        <input
                          type="number"
                          className="form-control"
                          placeholder={
                            supportType.amount !== undefined
                              ? supportType.amount
                              : t("Enter amount")
                          }
                          onChange={(value) => {
                            updateServerParams(
                              Number(value.target.value),
                              "amount"
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Target Category */}
                    <div className="row mb-4">
                      <div className="col-2 align-content-center">
                        <p className="m-0">
                          <strong>{t("Target Category")}</strong>
                        </p>
                      </div>
                      <div className="col-10 d-flex align-items-center">
                        <select
                          className="form-control form-select"
                          value={supportType.targetCategory || ""}
                          onChange={(e) => {
                            updateServerParams(
                              e.target.value,
                              "targetCategory"
                            );
                          }}
                          style={{
                            width: "100%",
                          }}
                        >
                          <option value="" disabled>
                            {t("Select Target Category")}
                          </option>
                          <option value="individuals">
                            {t("Individuals")}
                          </option>
                          <option value="families">{t("Families")}</option>
                        </select>
                      </div>
                    </div>

                    {/* Support Type Description */}
                    <div className="row mb-4">
                      <div className="col-2 align-content-center">
                        <p className="m-0">
                          <strong>{t("Support Type Description")}</strong>
                        </p>
                      </div>
                      <div className="col-10">
                        <textarea
                          maxlength="225"
                          rows="5"
                          className="form-control"
                          placeholder={
                            supportType
                              ? supportType.description
                              : t("Support type description")
                          }
                          onChange={(value) => {
                            updateServerParams(
                              value.target.value,
                              "description"
                            );
                          }}
                        />
                      </div>
                    </div>
                  </TabPane>
                  {/* Support Criteria */}
                  <TabPane tabId={2}>
                  <CreateSupportCriteria />
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </div>
        {/* Actions */}
        <div className="actions clearfix">
          <div
            className="button-group"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <div>
              <Button
                className={activeTab === 1 ? "previous disabled" : "previous"}
                onClick={() => toggleTab(activeTab - 1)}
              >
                {t("Previous")}
              </Button>
            </div>
            <div>
              <Button
                className={activeTab === 2 ? "next disabled" : "next"}
                onClick={() => toggleTab(activeTab + 1)}
              >
                {t("Next")}
              </Button>
            </div>
            <div>
              <Button
                color="primary"
                onClick={() => {
                  saveSupport();
                }}
              >
                <i className="mdi mdi-content-save me-2"></i>
                {t("Save")}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
