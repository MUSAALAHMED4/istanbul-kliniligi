import instance from "base_url";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
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
import { useTranslation } from "react-i18next";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import { MEDIA_URL } from "configs";
import { MDBDataTable } from "mdbreact";
import Emergency from "../Emergency/Emergency";
import Treearchive from "./treearchive";
import { Tooltip } from "reactstrap";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { is } from "immutable";

// Custom Accordion Toggle button
function CustomToggle({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey);

  return (
    <button
      type="button"
      className="btn btn-primary mb-1"
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
}

export default function FamilyDetails() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 1);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  const [family, setFamily] = useState({});
  const [sending, setSending] = useState(false);
  const { t, i18n } = useTranslation();
  const visitId = new URLSearchParams(window.location.search).get("visit");
  const [rentAmount, setRentAmount] = useState(0);
  const [isRedCrescent, setIsRedCrescent] = useState(null);
  const [waterBill, setWaterBill] = useState(null);
  const [gasBill, setGasBill] = useState(null);
  const [electricityBill, setElectricityBill] = useState(null);
  const [internetBill, setInternetBill] = useState(null);
  const [rent, setRent] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const { familyId, id } = useParams();
  const headOfFamily = family.individuals?.find(
    (item) => item.is_head_of_family
  );
  const [emergencyButtonActive, setemergencyButtonActive] = useState(false);

  const rtlDirection = i18n.language === "ar" ? "rtl" : "ltr";

  const getFamily = async () => {
    try {
      const { data } = await instance.get(`/families/${id}/`);
      setFamily(data);

      const redCrescent = data.incomes?.find(
        (item) => item.title?.item_name === "Red Crescent"
      );
      setIsRedCrescent(redCrescent && redCrescent.amount === 0 ? "No" : "Yes");

      const water = data.expenses?.find(
        (item) => item.title?.item_name === "Water Bill"
      );
      const gas = data.expenses?.find(
        (item) => item.title?.item_name === "Gas Bill"
      );
      const electricity = data.expenses?.find(
        (item) => item.title?.item_name === "Electricity Bill"
      );
      const internet = data.expenses?.find(
        (item) => item.title?.item_name === "Internet Bill"
      );
      const otherBill = data.expenses?.find(
        (item) => item.title?.item_name === "Other Bill"
      );
      const rentAmount = data.expenses?.find(
        (item) => item.title?.item_name === "Rent Amount"
      );

      setWaterBill(water);
      setGasBill(gas);
      setElectricityBill(electricity);
      setInternetBill(internet);
      setRent(rentAmount);

      setRentAmount(rentAmount?.amount || 0);
      setemergencyButtonActive(
        !(
          !data.is_draft ||
          !water ||
          !gas ||
          !electricity ||
          !internet ||
          !rentAmount
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const hasPendingEmergency = () =>
    emergencies.filter((item) =>
      ["pending", "processing"].includes(item.status)
    ).length == 0;

  // Tab toggle function
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const tabOrder =
    i18n.language === "ar"
      ? [4, 3, 2, 1] 
      : [1, 2, 3, 4]; 

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  const checkMissingFields = (
    isDraft,
    waterBill,
    gasBill,
    electricityBill,
    internetBill,
    rent
  ) => {
    let missingFields = [];
    if (isDraft) missingFields.push(t("Draft Individual"));
    if (!waterBill || waterBill.amount === 0)
      missingFields.push(t("Water Bill"));
    if (!gasBill || gasBill.amount === 0) missingFields.push(t("Gas Bill"));
    if (!electricityBill || electricityBill.amount === 0)
      missingFields.push(t("Electricity Bill"));
    if (!internetBill || internetBill.amount === 0)
      missingFields.push(t("Internet Bill"));
    if (!rent || rent.amount === 0) missingFields.push(t("Rent Amount"));

    return missingFields;
  };
  const areAllFieldsComplete = () => {
    const isDraft = family.is_draft;
    return (
      !isDraft &&
      waterBill &&
      waterBill.amount > 0 &&
      gasBill &&
      gasBill.amount > 0 &&
      electricityBill &&
      electricityBill.amount > 0 &&
      internetBill &&
      internetBill.amount > 0 &&
      rent &&
      rent.amount > 0
    );
  };

  const getFamilyEmergencySituations = async () => {
    try {
      const { data } = await instance.get(
        `/families/${id}/emergency_situations/`
      );

      console.log(data);
      setEmergencies(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getFamily();
    getFamilyEmergencySituations();
  }, [id]);

  // Get the status parameter from the URL
  const statusParam = new URLSearchParams(window.location.search).get("status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [isTreearchiveOpen, setIsTreearchiveOpen] = useState(false);
  const toggleTreearchiveModal = () => setIsTreearchiveOpen(!isTreearchiveOpen);

  // MDBDataTable
  const data = {
    columns: [
      {
        label: <span>{t("ID")}</span>,
        field: "id",
        sort: "asc",
        width: 100,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Name")}
          </span>
        ),
        field: "name",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Phone No.")}
          </span>
        ),
        field: "phone_no",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Gender")}
          </span>
        ),
        field: "gender",
        sort: "asc",
        width: 100,
      },
      {
        label: <span>{t("Address")}</span>,
        field: "address",
        sort: "disabled",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Status")}
          </span>
        ),
        field: "status",
        sort: "asc",
        width: 100,
      },
      {
        label: <span>{t("Action")}</span>,
        field: "action",
        sort: "disabled",
        width: 150,
      },
    ],
    rows:
      family?.individuals?.map((item) => ({
        id: item.id,
        name: item.name,
        phone_no: (
          <>
            {item.mobile_number} -{" "}
            <a href={`tel:${item.mobile_number}`}>{t("Call")}</a>
          </>
        ),
        gender: t(item.gender),
        address: (
          <>
            {t("Address")}{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps?q=${
                item.location?.split(",")[0]
              },${item.location?.split(",")[1]}`}
            >
              {t("see on map")}
            </a>
          </>
        ),
        status: (
          <span
            style={{
              color:
                item.status === "alive"
                  ? "green"
                  : item.status === "dead"
                  ? "red"
                  : "black",
            }}
          >
            {t(item.status)}
          </span>
        ),
        action: (
          <Link
            to={`/individual/${item.id}?family=${family.id}${
              visitId ? `&visit=${visitId}` : ""
            }`}
            className={`btn btn-sm btn-${
              item.is_draft ? "warning" : "primary"
            }`}
          >
            {t("Details")} {item.is_draft ? `(${t("Draft")})` : ""}
          </Link>
        ),
      })) || [],
  };
  // Function to return status icon based on the status value
  const renderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <i className="fas fa-clock text-warning"></i>;
      case "processing":
        return <i className="fas fa-spinner text-info"></i>;
      case "approved":
        return <i className="fas fa-check-circle text-success"></i>;
      case "rejection":
        return <i className="fas fa-times-circle text-danger"></i>;
      default:
        return <i className="fas fa-question-circle text-muted"></i>;
    }
  };

  // formatDescription
  const formatDescription = (description) => {
    return description && description.includes("Details:")
      ? description.split("Details:")[1].trim()
      : description || t("No details available.");
  };
  //truncateText
  const truncateText = (text, maxLength) => {
    if (!text) return t("No details available.");
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Emergency table data
  const emergencyData = {
    columns: [
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("ID")}
          </span>
        ),
        field: "id",
        sort: "asc",
        width: 100,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Applicant")}
          </span>
        ),
        field: "applicant",
        sort: "asc",
        width: 150,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Recipient")}
          </span>
        ),
        field: "name",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Support Type")}
          </span>
        ),
        field: "support_category",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Description")}
          </span>
        ),
        field: "description",
        sort: "asc",
        width: 150,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("status")}
          </span>
        ),
        field: "status",
        sort: "asc",
        width: 150,
      },

      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Action")}
          </span>
        ),
        field: "action",
        sort: "disabled",
        width: 150,
      },
    ],

    rows:
      emergencies?.map((item) => ({
        id: item.id,
        name:
          item.individual?.name ||
          item.family?.title ||
          t("No individual or family"),
        support_category: t(item.support_category),
        description: truncateText(formatDescription(item.description), 25),
        applicant: item.applicant?.name || t("Unknown"),
        status: (
          <span>
            {renderStatusIcon(item.status)} {t(item.status)}
          </span>
        ),
        action: (
          <Link
            to={`/families/${family.id}/emergency/${item.id}`}
            className={`btn btn-sm btn-${
              item.is_draft ? "warning" : "primary"
            }`}
          >
            {t("Details")}
          </Link>
        ),
      })) || [],
  };
  const sendTreeReport = async () => {
    setSending(true);
    const familyId = family.id;
    try {
      const response = await instance.get(
        `/families/${familyId}/send_genogram_report/`
      );
      setSending(false);
      if (response.status === 200) {
        alert("Report sent successfully");
      } else {
        alert("Failed to send report");
      }
    } catch (e) {
      setSending(false);
      console.error(e);
    }
  };
  // Family Information
  const [familyInfo, setFamilyInfo] = useState([]);
  useEffect(() => {
    getFamily();
    getFamilyEmergencySituations();
    setFamilyInfo([
      {
        rent_year: "224",
        bills: "Paid",
        red_crescent: "Yes",
      },
    ]);
  }, [id]);

  const familyInfoData = {
    columns: [
      {
        label: t("Family Total"),
        field: "familyTotal",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Husband's Salary"),
        field: "headOfFamilySalary",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Wife's Salary"),
        field: "wifeSalary",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Rent Amount"),
        field: "rentAmount",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Red Crescent"),
        field: "redCrescent",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Total of Bills"),
        field: "totalBills",
        sort: "asc",
        width: 100,
      },
      {
        label: t("Action"),
        field: "action",
        sort: "disabled",
        width: 150,
      },
    ],
    rows: familyInfo.map((info) => ({
      familyTotal: family.expenses_summary?.remaining || 0,
      headOfFamilySalary: headOfFamily ? Math.floor(headOfFamily.salary) : 0,
      wifeSalary: Math.floor(
        family.individuals?.find(
          (individual) => individual.id === headOfFamily?.partner_id
        )?.salary || 0
      ),
      rentAmount: rentAmount ? Math.floor(rentAmount) : 0,
      redCrescent: isRedCrescent,
      totalBills: family.expenses_summary?.total_bills || 0,
      action: (
        <Link to={`/familyinfo/${id}`} className="btn btn-sm btn-primary">
          {t("Details")}
        </Link>
      ),
    })),
  };
  console.log(emergencies);
  console.log("Family ID:", familyId);
  console.log("Family Details:", family);
  console.log("id", id);

  return (
    <React.Fragment>
      <div className="page-content" dir={rtlDirection}>
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-9">
              <Col md={5}>
                <h6 className="page-title ms-4">{family.title}</h6>
                <div
                  style={{ display: "flex", gap: "20px", marginLeft: "15px" }}
                >
                  <p className="mb-1">
                    {t("Family ID")}: {family?.id || t("Not available")}
                  </p>
                  <p className="mb-4">
                    {t("Family Members")}: {family?.individuals?.length || 0}
                  </p>
                </div>
              </Col>

              <Col md={7}>
                <div className="d-flex justify-content-end align-items-center">
                  {/* Emergency Button */}
                  <Button
                    color="secondary"
                    id="emergencyButton"
                    onClick={() => {
                      if (areAllFieldsComplete() && hasPendingEmergency()) {
                        toggleModal();
                      } else {
                        toggleTooltip();
                      }
                    }}
                    className={`mb-4 position-relative ${
                      rtlDirection === "rtl" ? "ms-3" : "me-3"
                    }`}
                  >
                    <i
                      className={`fas fa-hands-helping ${
                        rtlDirection === "rtl" ? "ms-2" : "me-2"
                      }`}
                    ></i>
                    {t("Emergency")}
                  </Button>

                  <Tooltip
                    placement="bottom"
                    isOpen={
                      tooltipOpen &&
                      (!areAllFieldsComplete() || !hasPendingEmergency())
                    }
                    target="emergencyButton"
                    toggle={toggleTooltip}
                    fade={true}
                  >
                    {!areAllFieldsComplete()
                      ? t("Please complete the following fields:") +
                        " " +
                        checkMissingFields(
                          family.is_draft,
                          waterBill,
                          gasBill,
                          electricityBill,
                          internetBill,
                          rent
                        ).join(", ")
                      : !hasPendingEmergency()
                      ? t("There are pending or processing emergencies")
                      : null}
                  </Tooltip>

                  <Emergency
                    isOpen={isModalOpen}
                    toggle={toggleModal}
                    familyId={id}
                  />

                  {/* Manage Family */}
                  <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                    <DropdownToggle
                      caret
                      color="primary"
                      className="mb-4 position-relative"
                    >
                      <i
                        className={`fas fa-edit  ${
                          rtlDirection === "rtl" ? "ms-2" : "me-2"
                        }`}
                      ></i>
                      {t("Manage Family")}
                    </DropdownToggle>
                    <DropdownMenu
                      className={`dropdown-menu-${
                        rtlDirection === "rtl" ? "start" : "end"
                      }`}
                      style={{
                        marginTop: "-14px",
                      }}
                    >
                      <DropdownItem>
                        <Link
                          to={`/individual/new?family=${family.id}${
                            visitId ? `&visit=${visitId}` : ""
                          }`}
                          className="text-decoration-none"
                        >
                          <i
                            className={`fas fa-user-plus  ${
                              rtlDirection === "rtl" ? "ms-2" : "me-2"
                            }`}
                          ></i>
                          {t("Add New Individual")}
                        </Link>
                      </DropdownItem>
                      <DropdownItem>
                        <Link
                          to={`/familyinfo/${family.id}`}
                          className="text-decoration-none"
                        >
                          <i
                            className={`fas fa-info-circle  ${
                              rtlDirection === "rtl" ? "ms-2" : "me-2"
                            }`}
                          ></i>
                          {t("Family Information")}
                        </Link>
                      </DropdownItem>
                      <DropdownItem>
                        <Link
                          to={`/families/${family.id}/report`}
                          className="text-decoration-none"
                        >
                          <i
                            className={`fas fa-file-alt  ${
                              rtlDirection === "rtl" ? "ms-2" : "me-2"
                            }`}
                          ></i>
                          {t("View Family Report")}
                        </Link>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </Col>
            </Row>
            <div
              className="form-wizard-wrapper wizard clearfix"
              style={{ marginBottom: "20px" }}
            >
              <div className="steps clearfix ">
                <ul>
                  {rtlDirection === "rtl" ? (
                    <>
                      <NavItem className={activeTab === 4 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(4)} >
                          <span className="number">4.</span>{" "}
                          {t("Emergency Details")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span className="number">3.</span>{" "}
                          {t("Family Information")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 2 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(2)}>
                          <span className="number">2.</span>{" "}
                          {t("Family Details")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 1 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(1)}>
                          <span className="number">1.</span> {t("Family Tree")}
                        </NavLink>
                      </NavItem>
                    </>
                  ) : (
                    <>
                      <NavItem className={activeTab === 1 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(1)}>
                          <span className="number">1.</span> {t("Family Tree")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 2 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(2)}>
                          <span className="number">2.</span>{" "}
                          {t("Family Details")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 3 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(3)}>
                          <span className="number">3.</span>{" "}
                          {t("Family Information")}
                        </NavLink>
                      </NavItem>

                      <NavItem className={activeTab === 4 ? "current" : ""}>
                        <NavLink onClick={() => toggleTab(4)}>
                          <span className="number">4.</span>{" "}
                          {t("Emergency Details")}
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
                    <TabPane tabId={1}>
                      {/* Family Tree Button Section without Accordion */}
                      <div className="mb-3">
                        <button
                          className="btn btn-danger mb-4"
                          onClick={sendTreeReport}
                        >
                          {sending ? "sending ..." : t("Send Report to Email")}
                        </button>

                        {/* Uncomment the following block if you want to add the Tree archive button */}

                        {/* <button
                              className="btn btn-primary mb-4"
                              onClick={toggleTreearchiveModal}
                            >
                              {t("Tree archive")}
                            </button>

                            <Treearchive
                              isOpen={isTreearchiveOpen}
                              toggle={toggleTreearchiveModal}
                              familyId={id}
                            />
                            */}

                        <br />
                        <img
                          src={`${MEDIA_URL}genogram/${family.id}.png`}
                          alt="Family Tree"
                        />
                      </div>
                    </TabPane>
                    {/* Family Details */}
                    <TabPane tabId={2}>
                      <div className="mb-4">
                        {/* Family Details */}
                        <MDBDataTable
                          infoLabel={[
                            t("Showing"),
                            t("to"),
                            t("of"),
                            t("entries"),
                          ]}
                          noRecordsFoundLabel={t("No records found")}
                          paginationLabel={[t("Previous"), t("Next"), t("End")]}
                          noBottomColumns={true}
                          responsive
                          striped
                          bordered
                          data={data}
                          displayEntries={false}
                          pagination
                        />
                      </div>
                    </TabPane>
                    <TabPane tabId={3}>
                      <MDBDataTable
                        searchLabel={t("Search")}
                        infoLabel={[
                          t("Showing"),
                          t("to"),
                          t("of"),
                          t("entries"),
                        ]}
                        noRecordsFoundLabel={t("No records found")}
                        paginationLabel={[t("Previous"), t("Next"), t("End")]}
                        noBottomColumns={true}
                        responsive
                        striped
                        bordered
                        data={familyInfoData}
                        displayEntries={false}
                        pagination
                      />{" "}
                    </TabPane>
                    <TabPane tabId={4}>
                      <MDBDataTable
                        searchLabel={t("Search")}
                        infoLabel={[
                          t("Showing"),
                          t("to"),
                          t("of"),
                          t("entries"),
                        ]}
                        noRecordsFoundLabel={t("No records found")}
                        paginationLabel={[t("Previous"), t("Next"), t("End")]}
                        noBottomColumns={true}
                        responsive
                        striped
                        bordered
                        data={emergencyData}
                        displayEntries={false}
                        pagination
                      />{" "}
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
                  className={activeTab === 4 ? "next disabled" : "next"}
                  onClick={() => toggleTab(activeTab + 1)}
                >
                  {t("Next")}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
