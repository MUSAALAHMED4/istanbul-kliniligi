import React, { useState, useEffect } from "react";
import instance from "base_url";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { withTranslation } from "react-i18next";
import Accordion from "react-bootstrap/Accordion";

function FamilyInformation({ t, i18n }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(1);
  const [familyInfo, setFamilyInfo] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalExpensesAll, setTotalExpensesAll] = useState(0);
  const [isRedCrescent, setIsRedCrescent] = useState(null);
  const [errorFields, setErrorFields] = useState([]);
  const [rtlDirection, setRtlDirection] = useState(
    i18n.language === "ar" ? "rtl" : "ltr"
  );
  const [tabOrder, setTabOrder] = useState([1, 2, 3]);
  const [totalFamilyIncome, setTotalFamilyIncome] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [expenses, setExpenses] = useState({
    waterBill: 0,
    gasBill: 0,
    electricityBill: 0,
    internetBill: 0,
    otherBill: 0,
  });
  const [incomes, setIncomes] = useState({
    salary: 0,
    redCrescent: "",
    additionalIncome: 0,
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    description: "",
    type: "",
  });
  const [individualList, setIndividualList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const validateFields = () => {
    const requiredFields = [
      "rentAmount",
      // "salary",
      // "redCrescent",
      "waterBill",
      "gasBill",
      "electricityBill",
      "internetBill",
      // "otherBill",
    ];
    const errors = requiredFields.filter(
      (field) => !expenses[field]?.amount && !incomes[field]?.amount
    );
    setErrorFields(errors);
    console.log(errors);
    return errors.length === 0;
  };

  // Fetch family details
  const getFamilyDetails = async () => {
    try {
      const { data } = await instance.get(`/families/${id}/`);
      setTotalExpenses(data.expenses_summary?.total_bills || 0);
      setTotalSalaries(data.expenses_summary?.total_salaries || 0);
      setTotalFamilyIncome(data.expenses_summary?.total_income || 0);
      setTotalExpensesAll(data.expenses_summary?.total_expenses || 0);

      const salary = data.incomes?.find(
        (item) => item.title?.item_name === "Salary"
      );
      const redCrescent = data.incomes?.find(
        (item) => item.title?.item_name === "Red Crescent"
      );
      const additionalIncome = data.incomes?.find(
        (item) => item.title?.item_name === "Additional Income"
      );
      setIncomes({
        salary: salary,
        redCrescent: redCrescent,
        additionalIncome: additionalIncome,
      });

      if (redCrescent && redCrescent.amount == 0) {
        setIsRedCrescent("No");
      } else {
        setIsRedCrescent("Yes");
      }

      const waterBill = data.expenses?.find(
        (item) => item.title?.item_name === "Water Bill"
      );
      const gasBill = data.expenses?.find(
        (item) => item.title?.item_name === "Gas Bill"
      );
      const electricityBill = data.expenses?.find(
        (item) => item.title?.item_name === "Electricity Bill"
      );
      const internetBill = data.expenses?.find(
        (item) => item.title?.item_name === "Internet Bill"
      );
      const otherBill = data.expenses?.find(
        (item) => item.title?.item_name === "Other Bill"
      );
      const rent = data.expenses?.find(
        (item) => item.title?.item_name === "Rent Amount"
      );
      const additionalExpenses = data.expenses?.find(
        (item) => item.title?.item_name === "Additional Expenses"
      );
      setExpenses({
        waterBill: waterBill,
        gasBill: gasBill,
        electricityBill: electricityBill,
        internetBill: internetBill,
        otherBill: otherBill,
        rentAmount: rent,
        additionalExpenses: additionalExpenses,
      });
      setFamilyInfo(data);
    } catch (error) {
      console.error(t("Error fetching family data:"), error);
    }
  };

  // Fields Tabs Mapping
  const fields_tabs_mapping = {
    1: ["redCrescent"],
    2: ["rentAmount"],
    3: ["waterBill", "gasBill", "electricityBill", "internetBill"],
  };

  // Fetch individual list
  const getIndividuals = async () => {
    try {
      const { data } = await instance.get(`/families/${id}/individuals/`);
      setIndividualList(data); // Update individual list

      const totalIncome = data.reduce((sum, individual) => {
        return individual.is_working
          ? sum + parseInt(individual.salary || 0)
          : sum;
      }, 0);

      setTotalFamilyIncome(totalIncome);
    } catch (error) {
      console.error(t("Error fetching individuals:"), error);
    }
  };

  useEffect(() => {
    getFamilyDetails();
    getIndividuals();
  }, [id]);

  // Save family information
  const saveFamilyInfo = async () => {
    if (!validateFields()) {
      setAlert({
        show: true,
        message: t("Error"),
        description: t("Please fill in all required fields."),
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    const payload = [];

    for (const [key, value] of Object.entries(expenses)) {
      if (value) {
        payload.push({
          key: key,
          amount: value.amount || null,
          family: value.family || null,
          additional_info: value.additional_info || null,
          id: value.id || null,
          type: "expense",
        });
      }
    }

    for (const [key, value] of Object.entries(incomes)) {
      if (key === "redCrescent" && isRedCrescent === "No") {
        payload.push({
          key: key,
          amount: 0,
          family: id || null,
          additional_info: value.additional_info || null,
          id: value.id || null,
          type: "income",
        });
      } else {
        if (value) {
          payload.push({
            key: key,
            amount: value.amount || null,
            family: id || null,
            additional_info: value.additional_info || null,
            id: value.id || null,
            type: "income",
          });
        }
      }
    }

    try {
      const response = await instance.put(
        `/families/${id}/save_information/`,
        payload
      );
      setAlert({
        show: true,
        message: t("Success"),
        description: t("Family information has been saved successfully."),
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error(t("Error saving family information:"), error);
      setAlert({
        show: true,
        message: t("Error"),
        description: t("Error saving family information."),
        type: "error",
      });
    }

    setIsSaving(false);
  };

  const calculateTotalExpenses = (item, value) => {
    // update the value of the item in the total expenses
    let total = 0;
    for (const [key, value] of Object.entries(expenses)) {
      if (key == "rentAmount" || key == "additionalExpenses") {
        continue;
      }
      if (key != item) {
        total += parseInt(value?.amount || 0);
      }
    }
    total += parseInt(value);
    setTotalExpenses(total);
    setTotalExpensesAll(total + parseInt(expenses.rentAmount?.amount || 0) + parseInt(expenses.additionalExpenses?.amount || 0));
  };

  useEffect(() => {
    getFamilyDetails();
    setRtlDirection(i18n.language === "ar" ? "rtl" : "ltr");

    // Set tab order based on language direction
    setTabOrder(i18n.language === "ar" ? [3, 2, 1] : [1, 2, 3]);
  }, [id, i18n.language]);

  // Toggle tab
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        {alert.show && (
          <div
            className="alert alert-danger fade show"
            role="alert"
            style={{
              position: "fixed",
              bottom: "0",
              right: "0",
              top: "auto",
              zIndex: 1050,
            }}
          >
            {alert.description}
          </div>
        )}
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={8}>
                <h6 className="page-title">{t("Edit Family Information")}</h6>
              </Col>
            </Row>

            {/* Navigation Tabs */}
            <div
              className="form-wizard-wrapper wizard clearfix"
              style={{
                marginBottom: "20px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="steps clearfix">
                <ul
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                    listStyleType: "none",
                    gap: "20px",
                  }}
                >
                  {rtlDirection === "rtl" ? (
                    <>
                      {/* التبويبة 1 تصبح في المكان 3 */}
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
                            }}
                          >
                            1.
                          </span>
                          <span>{t("Additional Income")}</span>
                        </NavLink>
                      </NavItem>

                      {/* التبويبة 2 تبقى كما هي */}
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
                            }}
                          >
                            2.
                          </span>
                          <span>{t("Family Expenses")}</span>
                        </NavLink>
                      </NavItem>

                      {/* التبويبة 3 تصبح في المكان 1 */}
                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            3.
                          </span>
                          <span>{t("Expenses Summary")}</span>
                        </NavLink>
                      </NavItem>
                    </>
                  ) : (
                    <>
                      {/* الوضع الطبيعي للغة الإنجليزية */}
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
                            }}
                          >
                            1.
                          </span>
                          <span>{t("Additional Income")}</span>
                        </NavLink>
                      </NavItem>

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
                            }}
                          >
                            2.
                          </span>
                          <span>{t("Family Expenses")}</span>
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span
                            className="number"
                            style={{
                              border: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "1px solid red"
                                : "1px solid #ced4da",
                              backgroundColor: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "red"
                                : "inherit",
                              color: errorFields.some((x) =>
                                fields_tabs_mapping[3].includes(x)
                              )
                                ? "white"
                                : "inherit",
                              borderRadius: "50%",
                              padding: "5px 10px",
                            }}
                          >
                            3.
                          </span>
                          <span>{t("Expenses Summary")}</span>
                        </NavLink>
                      </NavItem>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Family  */}
            <Col sm="12">
              <Card>
                <CardBody>
                  <Row className="align-items-center mb-8"></Row>
                  <TabContent activeTab={activeTab} className="body">
                    {/* Additional Income */}
                    <TabPane tabId={1}>
                      {/* Family Salaries */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Family Salaries")}</strong>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={totalSalaries || 0}
                            readOnly
                            style={{
                              height: "40px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                      {/* Red Crescent */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Red Crescent")}</strong>
                          <span style={{ color: "red" }}> * </span>
                        </Col>
                        <Col md={4}>
                          <select
                            className="form-control form-select"
                            value={isRedCrescent}
                            onChange={(e) => {
                              if (e.target.value === "No") {
                                setIncomes({
                                  ...incomes,
                                  redCrescent: {
                                    ...incomes.redCrescent,
                                    amount: 0,
                                  },
                                });
                                setTotalFamilyIncome(
                                  totalSalaries +
                                  parseInt(
                                    incomes.additionalIncome?.amount || 0
                                  )
                                );
                              }
                              setIsRedCrescent(e.target.value);
                            }}
                            required
                            style={{
                              height: "40px",
                              border: errorFields.includes("redCrescent")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          >
                            <option value="">{t("Select Status")}</option>
                            <option value="Yes">{t("Yes")}</option>
                            <option value="No">{t("No")}</option>
                          </select>
                        </Col>
                      </Row>
                      {/* Show fields based on Red Crescent selection */}
                      {isRedCrescent === "No" && (
                        <Row className="mb-4">
                          <Col md={2}>
                            <strong>{t("Reason for Stop")}</strong>
                            <span style={{ color: "red" }}> *</span>
                          </Col>
                          <Col md={4}>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                incomes?.redCrescent?.additional_info?.reason ||
                                ""
                              }
                              onChange={(e) =>
                                setIncomes({
                                  ...incomes,
                                  redCrescent: {
                                    ...incomes.redCrescent,
                                    additional_info: {
                                      reason: e.target.value,
                                    },
                                  },
                                })
                              }
                              required
                              style={{
                                height: "40px",
                                border: errorFields.includes("reasonForStop")
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </Col>
                        </Row>
                      )}
                      {isRedCrescent === "Yes" && (
                        <Row className="mb-4">
                          <Col md={2}>
                            <strong>{t("Amount Received")}</strong>
                            <span style={{ color: "red" }}> *</span>
                          </Col>
                          <Col md={4}>
                            <input
                              type="number"
                              className="form-control"
                              value={
                                incomes.redCrescent?.amount
                                  ? parseInt(incomes.redCrescent.amount, 10)
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^\d]/g,
                                  ""
                                );
                                setIncomes({
                                  ...incomes,
                                  redCrescent: {
                                    ...incomes.redCrescent,
                                    amount: value,
                                  },
                                });
                                setTotalFamilyIncome(
                                  totalSalaries +
                                  parseInt(value || 0) +
                                  parseInt(
                                    incomes.additionalIncome?.amount || 0
                                  )
                                );
                              }}
                              required
                              style={{
                                height: "40px",
                                border: errorFields.includes(
                                  "redCrescentAmount"
                                )
                                  ? "1px solid red"
                                  : "1px solid #ced4da",
                              }}
                            />
                          </Col>
                        </Row>
                      )}
                      {/* Additional Income */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Additional Income")}</strong>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={incomes.additionalIncome?.amount || ""}
                            onChange={(e) => {
                              // setAdditionalIncome(
                              //   e.target.value.replace(/[^\d]/g, "")
                              // )
                              const value = e.target.value.replace(
                                /[^\d]/g,
                                ""
                              );
                              setIncomes({
                                ...incomes,
                                additionalIncome: {
                                  ...incomes.additionalIncome,
                                  amount: value,
                                },
                              });
                              setTotalFamilyIncome(
                                totalSalaries +
                                parseInt(value || 0) +
                                parseInt(incomes.redCrescent?.amount || 0)
                              );
                            }}
                            style={{
                              height: "40px",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                      {/* Family Total */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Family Total")}</strong>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={totalFamilyIncome || 0}
                            readOnly
                            style={{
                              height: "40px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                    </TabPane>

                    {/* Family Salaries */}
                    <TabPane tabId={2}>
                      {/* Rent Amount */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Rent Amount")}</strong>
                          <span style={{ color: "red" }}> * </span>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={
                              expenses.rentAmount?.amount
                                ? parseInt(expenses.rentAmount.amount, 10)
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d]/g,
                                ""
                              );
                              setExpenses({
                                ...expenses,
                                rentAmount: {
                                  ...expenses.rentAmount,
                                  amount: value,
                                },
                              });
                              setTotalExpensesAll(
                                totalExpenses + parseInt(value || 0) + parseInt(expenses.additionalExpenses?.amount || 0)
                              )
                            }}
                            required
                            style={{
                              height: "40px",
                              border: errorFields.includes("rentAmount")
                                ? "1px solid red"
                                : "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                      {/* Bills Section */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Bills Section")}</strong>
                          <span style={{ color: "red" }}> * </span>
                        </Col>
                        <Col md={4}>
                          <Accordion defaultActiveKey={null}>
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                {t("Bills Section")}
                              </Accordion.Header>
                              <Accordion.Body>
                                {/* Bill Notes */}
                                <small
                                  className="text-center d-block mb-3"
                                  style={{ color: "red" }}
                                >
                                  {t("If there's no bill, put 0")}
                                </small>

                                <small
                                  className="text-center d-block mb-3"
                                  style={{ color: "green" }}
                                >
                                  {t(
                                    "The total amount will be calculated automatically after entering all bills."
                                  )}
                                </small>

                                {/* Water Bill */}
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <label>{t("Water Bill")}</label>
                                    <span style={{ color: "red" }}> * </span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={expenses.waterBill?.amount || ""}
                                      onChange={(e) => {
                                        setExpenses({
                                          ...expenses,
                                          waterBill: {
                                            ...expenses.waterBill,
                                            amount: e.target.value,
                                          },
                                        });
                                        calculateTotalExpenses(
                                          "waterBill",
                                          e.target.value
                                        );
                                      }}
                                      required
                                      style={{
                                        height: "40px",
                                        border: errorFields.includes(
                                          "waterBill"
                                        )
                                          ? "1px solid red"
                                          : "1px solid #ced4da",
                                      }}
                                    />
                                  </Col>

                                  {/* Gas Bill */}
                                  <Col md={6}>
                                    <label>{t("Gas Bill")}</label>
                                    <span style={{ color: "red" }}> * </span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={expenses.gasBill?.amount || ""}
                                      onChange={(e) => {
                                        setExpenses({
                                          ...expenses,
                                          gasBill: {
                                            ...expenses.gasBill,
                                            amount: e.target.value,
                                          },
                                        });
                                        calculateTotalExpenses(
                                          "gasBill",
                                          e.target.value
                                        );
                                      }}
                                      required
                                      style={{
                                        height: "40px",
                                        border: errorFields.includes("gasBill")
                                          ? "1px solid red"
                                          : "1px solid #ced4da",
                                      }}
                                    />
                                  </Col>
                                </Row>

                                {/* Electricity Bill */}
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <label>{t("Electricity Bill")}</label>
                                    <span style={{ color: "red" }}> * </span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={
                                        expenses.electricityBill?.amount || ""
                                      }
                                      onChange={(e) => {
                                        setExpenses({
                                          ...expenses,
                                          electricityBill: {
                                            ...expenses.electricityBill,
                                            amount: e.target.value,
                                          },
                                        });
                                        calculateTotalExpenses(
                                          "electricityBill",
                                          e.target.value
                                        );
                                      }}
                                      required
                                      style={{
                                        height: "40px",
                                        border: errorFields.includes(
                                          "electricityBill"
                                        )
                                          ? "1px solid red"
                                          : "1px solid #ced4da",
                                      }}
                                    />
                                  </Col>

                                  {/* Internet Bill */}
                                  <Col md={6}>
                                    <label>{t("Internet Bill")}</label>
                                    <span style={{ color: "red" }}> * </span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={
                                        expenses.internetBill?.amount || ""
                                      }
                                      onChange={(e) => {
                                        setExpenses({
                                          ...expenses,
                                          internetBill: {
                                            ...expenses.internetBill,
                                            amount: e.target.value,
                                          },
                                        });
                                        calculateTotalExpenses(
                                          "internetBill",
                                          e.target.value
                                        );
                                      }}
                                      required
                                      style={{
                                        height: "40px",
                                        border: errorFields.includes(
                                          "internetBill"
                                        )
                                          ? "1px solid red"
                                          : "1px solid #ced4da",
                                      }}
                                    />
                                  </Col>
                                </Row>

                                {/* Other Bill and Total of Bills */}
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <label>{t("Other Bill")}</label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={expenses.otherBill?.amount || 0}
                                      onChange={(e) => {
                                        setExpenses({
                                          ...expenses,
                                          otherBill: {
                                            ...expenses.otherBill,
                                            amount: e.target.value,
                                          },
                                        });
                                        calculateTotalExpenses(
                                          "otherBill",
                                          e.target.value
                                        );
                                      }}
                                      required
                                      style={{
                                        height: "40px",
                                        border: errorFields.includes(
                                          "otherBill"
                                        )
                                          ? "1px solid red"
                                          : "1px solid #ced4da",
                                      }}
                                    />
                                  </Col>

                                  <Col md={6}>
                                    <label>{t("Total of Bills")}</label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={totalExpenses}
                                      readOnly
                                      style={{ height: "40px" }}
                                    />
                                  </Col>
                                </Row>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </Col>
                      </Row>

                      {/* Show total bills outside the Accordion when it's calculated */}
                      {familyInfo.expenses_summary?.total_bills > 0 && (
                        <Row className="mb-4">
                          <Col md={2}>
                            <strong>{t("Total of Bills")}</strong>
                          </Col>
                          <Col md={4}>
                            <input
                              type="number"
                              className="form-control"
                              value={totalExpenses}
                              readOnly
                              style={{ height: "40px" }}
                            />
                          </Col>
                        </Row>
                      )}
                      {/* Additional Expenses */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Additional Expenses")}</strong>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={expenses.additionalExpenses?.amount || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d]/g,
                                ""
                              );
                              setExpenses({
                                ...expenses,
                                additionalExpenses: {
                                  ...expenses.additionalExpenses,
                                  amount: value,
                                },
                              });
                              setTotalExpensesAll(
                                totalExpenses + parseInt(value || 0) + parseInt(expenses.rentAmount?.amount || 0)
                              )
                            }}
                            style={{
                              height: "40px",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                      {/* Family Expenses Total */}
                      <Row className="mb-4">
                        <Col md={2}>
                          <strong>{t("Family Expenses Total")}</strong>
                        </Col>
                        <Col md={4}>
                          <input
                            type="number"
                            className="form-control"
                            value={totalExpensesAll || 0}
                            readOnly
                            style={{
                              height: "40px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId={3}>
                      <Row className="mb-4">
                        <Col md={12}>
                          {/* Family Income */}
                          <Row className="mb-4">
                            <Col md={2}>
                              <strong>{t("Family Income")}</strong>
                            </Col>
                            <Col md={4}>
                              <input
                                type="number"
                                className="form-control"
                                value={
                                  familyInfo.expenses_summary?.total_income || 0
                                }
                                readOnly
                                style={{
                                  height: "40px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #ced4da",
                                }}
                              />
                            </Col>
                          </Row>

                          {/* Family Expenses */}
                          <Row className="mb-4">
                            <Col md={2}>
                              <strong>{t("Family Expenses")}</strong>
                            </Col>
                            <Col md={4}>
                              <input
                                type="number"
                                className="form-control"
                                value={
                                  familyInfo.expenses_summary?.total_expenses ||
                                  0
                                }
                                readOnly
                                style={{
                                  height: "40px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #ced4da",
                                }}
                              />
                            </Col>
                          </Row>

                          {/* Remaining Amount */}
                          <Row className="mb-4">
                            <Col md={2}>
                              <strong>{t("Remaining Amount")}</strong>
                            </Col>
                            <Col md={4}>
                              <input
                                type="number"
                                className="form-control"
                                value={
                                  familyInfo.expenses_summary?.remaining || 0
                                }
                                readOnly
                                style={{
                                  height: "40px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #ced4da",
                                  color:
                                    familyInfo.expenses_summary?.remaining < 0
                                      ? "red"
                                      : "inherit",
                                }}
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </div>
          {/* Action Buttons */}
          <div className="d-flex justify-content-end align-items-center gap-2">
            <Button color="secondary" onClick={() => navigate(-1)}>
              {t("Cancel")}
            </Button>
            <Button
              color="primary"
              onClick={saveFamilyInfo}
              disabled={isSaving}
            >
              {isSaving ? t("Saving...") : t("Save")}
            </Button>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default withTranslation()(FamilyInformation);
