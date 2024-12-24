import React, { useEffect, useState } from "react";
import instance from "base_url";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Button, Table } from "reactstrap";
import { useTranslation } from "react-i18next";
import { MEDIA_URL } from "../../configs";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import logoSm from "../../assets/images/logo-sm.png";
import jsPDF from "jspdf";

const FamilyReport = () => {
  const { id, familyId } = useParams();
  const { t, i18n } = useTranslation();
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState({});
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [rentAmount, setRentAmount] = useState(0);
  const [isRedCrescent, setIsRedCrescent] = useState(null);
  const [redCrescent, setRedCrescent] = useState(null);
  const [totalBills, setTotalBills] = useState(0);
  const [income, setIncome] = useState(0);
  const [volunteerName, setVolunteerName] = useState("0");
  const [requestDate] = useState(new Date().toLocaleDateString());

  // Counters for condition and disability severities
  const [illnessSeverity, setIllnessSeverity] = useState({ 1: 0, 2: 0, 3: 0 });
  const [disabilitySeverity, setDisabilitySeverity] = useState({
    1: 0,
    2: 0,
    3: 0,
  });

  // Variables to store age counts
  const [underTwo, setUnderTwo] = useState(0);
  const [overTwo, setOverTwo] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [adults, setAdults] = useState(0);

  // Fetch family and individual data
  const fetchFamilyIndividuals = async () => {
    try {
      const { data } = await instance.get(`/families/${familyId}/`);
      setIndividuals(data.individuals || []);
      setFamily(data);

      const head = data.individuals.find((ind) => ind.is_head_of_family);
      setHeadOfFamily(head);

      const redCrescent = data.incomes?.find(
        (item) => item.title?.item_name === "Red Crescent"
      );

      setRedCrescent(redCrescent);
      setIsRedCrescent(redCrescent && redCrescent.amount !== 0 ? "Yes" : "No");

      const income = data.incomes?.find(
        (item) => item.title?.item_name === "Salary"
      );
      setIncome(income?.amount || 0);

      const totalExpenses = [
        "Water Bill",
        "Gas Bill",
        "Electricity Bill",
        "Internet Bill",
        "Other",
      ].reduce(
        (sum, billType) =>
          sum +
          parseInt(
            data.expenses?.find((item) => item.title?.item_name === billType)
              ?.amount || 0
          ),
        0
      );
      setTotalBills(totalExpenses);

      const rent = data.expenses?.find(
        (item) => item.title?.item_name === "Rent Amount"
      );
      setRentAmount(rent?.amount || 0);

      // Calculate age categories
      calculateAgeCategories(data.individuals);
      // Calculate condition and disability severities
      calculateConditionSeverities(data.individuals);
    } catch (error) {
      console.error("Error fetching family data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate age categories based on individual ages
  const calculateAgeCategories = (individuals) => {
    const currentYear = new Date().getFullYear();
    let underTwoCount = 0;
    let overTwoCount = 0;
    let seniorsCount = 0;
    let adultsCount = 0;

    individuals.forEach((individual) => {
      const birthYear = new Date(individual.date_of_birth).getFullYear();
      const age = currentYear - birthYear;

      if (age < 2) {
        underTwoCount++;
      } else if (age >= 2 && age < 18) {
        overTwoCount++;
      } else if (age >= 18 && age < 55) {
        adultsCount++;
      } else if (age >= 55) {
        seniorsCount++;
      }
    });

    setUnderTwo(underTwoCount);
    setOverTwo(overTwoCount);
    setAdults(adultsCount);
    setSeniors(seniorsCount);
  };
  // Function to calculate age based on date of birth
  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const ageDiff = new Date() - birthDate;
    const age = new Date(ageDiff).getUTCFullYear() - 1970;
    return age;
  };

  // Function to calculate the number of conditions by severity
  const calculateConditionSeverities = (individuals) => {
    const illnessCount = { 1: 0, 2: 0, 3: 0 };
    const disabilityCount = { 1: 0, 2: 0, 3: 0 };

    individuals.forEach((individual) => {
      if (individual.has_condition) {
        if (individual.condition_type === "illness") {
          illnessCount[individual.condition_severity]++;
        } else if (individual.condition_type === "disability") {
          disabilityCount[individual.condition_severity]++;
        }
      }
    });

    setIllnessSeverity(illnessCount);
    setDisabilitySeverity(disabilityCount);
  };

  useEffect(() => {
    fetchFamilyIndividuals();
  }, [familyId]);

  // Function to download PDF with optimizations
  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    const buttons = document.querySelectorAll(".d-print-none");

    // Hide buttons temporarily
    buttons.forEach((button) => (button.style.display = "none"));

    // Ensure all images are fully loaded
    const images = input.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      )
    );

    // Capture the content as a lower-resolution canvas
    const canvas = await html2canvas(input, {
      scale: 2.5, // Reduced scale factor for smaller file size
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG format with quality 0.8

    // Create a new jsPDF instance
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Draw the canvas image onto the PDF
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // Set file name dynamically based on family details
    const headOfFamilyName = headOfFamily
      ? `${headOfFamily.first_name}_${headOfFamily.last_name}`
      : "Unknown";
    const fileName = `${t("Family Report")}_${headOfFamilyName}.pdf`;

    // Save the PDF
    pdf.save(fileName);

    // Show buttons again
    buttons.forEach((button) => (button.style.display = "block"));
  };

  const isRTL = i18n.language === "ar";

  console.log("individuals", individuals);
  console.log("volunteer_name", family);

  return (
    <React.Fragment>
      <div className="page-content" dir={isRTL ? "rtl" : "ltr"}>
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={5}>
                <h6 className="page-title">{t("Family Report")}</h6>
              </Col>
            </Row>
          </div>
          <Row>
            <div className="col-15">
              <Card>
                <CardBody id="pdf-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#333" }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("Family Id")}: {familyId}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#333",
                          fontWeight: "bold",
                        }}
                      >
                        {t("Request Date")}: {new Date().toLocaleDateString()}
                      </p>
                    </div>

                    <h3 style={{ marginTop: 0, fontSize: "18px" }}>
                      <img src={logoSm} alt="logo" height="30" />
                    </h3>
                  </div>
                  <hr style={{ marginTop: "1px", borderColor: "#343a40" }} />
                  {/* Individual information table */}
                  <Row>
                    <div className="col-12">
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          marginBottom: "2px",
                          color: "#000",
                          textTransform: "uppercase",
                        }}
                      >
                        <h4>{t("Individuals Information")}</h4>
                      </div>
                      <Table
                        bordered
                        responsive
                        style={{
                          borderColor: "#343a40",
                          width: "95%",
                          margin: "auto",
                        }}
                      >
                        <thead>
                          <tr style={{ borderColor: "#343a40" }}>
                            <th
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "20px",
                                borderColor: "#343a40",
                              }}
                            >
                              {t("Name")}
                            </th>
                            <th
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "20px",
                                borderColor: "#343a40",
                              }}
                            >
                              {t("Date of Birth (Age)")}
                            </th>
                            <th
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "20px",
                                borderColor: "#343a40",
                              }}
                            >
                              {t("Job Title")}
                            </th>
                            <th
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "20px",
                                borderColor: "#343a40",
                              }}
                            >
                              {t("Salary")}
                            </th>
                            <th
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "20px",
                                borderColor: "#343a40",
                              }}
                            >
                              {t("Status")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {individuals.length > 0 ? (
                            <>
                              {headOfFamily && (
                                <tr
                                  key={headOfFamily.id}
                                  style={{ borderColor: "#343a40" }}
                                >
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      color: "#000",
                                      fontSize: "18px",
                                      borderColor: "#343a40",
                                    }}
                                  >
                                    <strong>
                                      {`${headOfFamily.first_name} ${headOfFamily.last_name} `}
                                      <span>({t("Husband's")})</span>
                                    </strong>
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      color: "#000",
                                      fontSize: "18px",
                                      borderColor: "#343a40",
                                    }}
                                  >
                                    {headOfFamily.date_of_birth ? (
                                      `${
                                        headOfFamily.date_of_birth
                                      } (${calculateAge(
                                        headOfFamily.date_of_birth
                                      )})`
                                    ) : (
                                      <i
                                        className="fas fa-ban"
                                        style={{ color: "red" }}
                                      ></i>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      color: "#000",
                                      fontSize: "18px",
                                      borderColor: "#343a40",
                                    }}
                                  >
                                    {headOfFamily.job_title ? (
                                      headOfFamily.job_title
                                    ) : (
                                      <i
                                        className="fas fa-ban"
                                        style={{ color: "red" }}
                                      ></i>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      color: "#000",
                                      fontSize: "18px",
                                      borderColor: "#343a40",
                                    }}
                                  >
                                    {headOfFamily.is_working &&
                                    headOfFamily.salary ? (
                                      parseInt(headOfFamily.salary, 10)
                                    ) : (
                                      <i
                                        className="fas fa-ban"
                                        style={{ color: "red" }}
                                      ></i>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      color:
                                        headOfFamily.status === "alive"
                                          ? "green"
                                          : headOfFamily.status === "dead"
                                          ? "red"
                                          : headOfFamily.status === "lost"
                                          ? "gray"
                                          : "black",
                                      fontSize: "18px",
                                      borderColor: "#343a40",
                                    }}
                                  >
                                    {t(headOfFamily.status)}
                                  </td>
                                </tr>
                              )}
                              {individuals
                                .filter(
                                  (individual) => !individual.is_head_of_family
                                )
                                .map((individual) => (
                                  <tr
                                    key={individual.id}
                                    style={{ borderColor: "#343a40" }}
                                  >
                                    <td
                                      style={{
                                        fontWeight: "bold",
                                        color: "#000",
                                        fontSize: "18px",
                                        borderColor: "#343a40",
                                      }}
                                    >
                                      {`${individual.first_name} ${individual.last_name}`}
                                      {individual.id ===
                                        headOfFamily?.partner_id && (
                                        <strong>
                                          {" "}
                                          <span> ({t("Wife's")})</span>
                                        </strong>
                                      )}
                                    </td>
                                    <td
                                      style={{
                                        fontWeight: "bold",
                                        color: "#000",
                                        fontSize: "18px",
                                        borderColor: "#343a40",
                                      }}
                                    >
                                      {individual.date_of_birth ? (
                                        `${
                                          individual.date_of_birth
                                        } (${calculateAge(
                                          individual.date_of_birth
                                        )})`
                                      ) : (
                                        <i
                                          className="fas fa-ban"
                                          style={{ color: "red" }}
                                        ></i>
                                      )}
                                    </td>
                                    <td
                                      style={{
                                        fontWeight: "bold",
                                        color: "#000",
                                        fontSize: "18px",
                                        borderColor: "#343a40",
                                      }}
                                    >
                                      {individual.job_title ? (
                                        individual.job_title
                                      ) : (
                                        <i
                                          className="fas fa-ban"
                                          style={{ color: "red" }}
                                        ></i>
                                      )}
                                    </td>
                                    <td
                                      style={{
                                        fontWeight: "bold",
                                        color: "#000",
                                        fontSize: "18px",
                                        borderColor: "#343a40",
                                      }}
                                    >
                                      {individual.is_working &&
                                      individual.salary ? (
                                        parseInt(individual.salary, 10)
                                      ) : (
                                        <i
                                          className="fas fa-ban"
                                          style={{ color: "red" }}
                                        ></i>
                                      )}
                                    </td>
                                    <td
                                      style={{
                                        fontWeight: "bold",
                                        color:
                                          individual.status === "alive"
                                            ? "green"
                                            : individual.status === "dead"
                                            ? "red"
                                            : individual.status === "lost"
                                            ? "gray"
                                            : "black",
                                        fontSize: "18px",
                                        borderColor: "#343a40",
                                      }}
                                    >
                                      {t(individual.status)}
                                    </td>
                                  </tr>
                                ))}
                            </>
                          ) : (
                            <tr style={{ borderColor: "#343a40" }}>
                              <td
                                colSpan="6"
                                className="text-center"
                                style={{
                                  fontWeight: "bold",
                                  color: "#000",
                                  fontSize: "18px",
                                  borderColor: "#343a40",
                                }}
                              >
                                <i
                                  className="fas fa-ban"
                                  style={{ color: "red" }}
                                ></i>{" "}
                                {t("No Data Available")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Row>
                  <Row>
                    {/* Family Tree Section */}
                    <Row>
                      <Col md={12}>
                        <Card>
                          <CardBody>
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginBottom: "2px",
                                color: "#333",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("Family Tree")}
                            </div>
                            <div
                              style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                borderRadius: "5px",
                                backgroundColor: "#f9f9f9",
                                marginBottom: "2px",
                              }}
                            >
                              <img
                                src={`${MEDIA_URL}genogram/${family.id}.png`}
                                alt="Family Tree"
                                style={{ width: "80%", height: "auto" }}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>

                    <Col md={6} style={{ marginBottom: "2px" }}>
                      <Card>
                        <CardBody>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              marginBottom: "2px",
                              color: "#333",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("Request Information")}
                          </div>
                          <Table
                            bordered
                            responsive
                            style={{
                              borderColor: "#343a40",

                              margin: "auto",
                            }}
                          >
                            <tbody>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Husband's Name")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {headOfFamily ? (
                                    `${headOfFamily.first_name} ${headOfFamily.last_name}`
                                  ) : (
                                    <i
                                      className="fas fa-ban"
                                      style={{ color: "red" }}
                                    ></i>
                                  )}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Wife's Name")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {individuals.some(
                                    (ind) => ind.id === headOfFamily?.partner_id
                                  ) ? (
                                    `${
                                      individuals.find(
                                        (ind) =>
                                          ind.id === headOfFamily.partner_id
                                      ).first_name
                                    } ${
                                      individuals.find(
                                        (ind) =>
                                          ind.id === headOfFamily.partner_id
                                      ).last_name
                                    }`
                                  ) : (
                                    <i
                                      className="fas fa-ban"
                                      style={{ color: "red" }}
                                    ></i>
                                  )}
                                </td>
                              </tr>

                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Rent Amount")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {rentAmount ? Math.floor(rentAmount) : 0}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Red Crescent")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {isRedCrescent === "Yes" ? (
                                    <>
                                      {t("Yes")} : &nbsp;
                                      <span style={{ fontWeight: "bold" }}>
                                        {redCrescent?.amount ? (
                                          Math.floor(redCrescent.amount)
                                        ) : (
                                          <i className="fas fa-ban"></i>
                                        )}
                                      </span>
                                    </>
                                  ) : isRedCrescent === "No" ? (
                                    <>
                                      {t("No")} : &nbsp;
                                      <span style={{ fontWeight: "bold" }}>
                                        {redCrescent?.additional_info
                                          ?.reason || (
                                          <i className="fas fa-ban"></i>
                                        )}
                                      </span>
                                    </>
                                  ) : (
                                    <i className="fas fa-ban"></i>
                                  )}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Family Income")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {income ? Math.floor(income) : 0}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Total of Bills")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {totalBills || 0}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Mobile Number")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {headOfFamily?.mobile_number ||
                                    (individuals.length > 0
                                      ? individuals[0].mobile_number
                                      : 0)}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Address")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    wordBreak: "break-word",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {headOfFamily?.address ||
                                    (individuals.length > 0
                                      ? individuals[0].address
                                      : "0")}
                                </td>
                              </tr>
                            </tbody>
                          </Table>

                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginBottom: "2px",
                              color: "#000",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("Medical Condition / Disability")}
                          </div>
                          <Table
                            bordered
                            responsive
                            style={{
                              borderColor: "#343a40",
                              margin: "auto",
                            }}
                          >
                            <thead>
                              <tr style={{ borderColor: "#343a40" }}>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Category")}
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Severity 1")}
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Severity 2")}
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Severity 3")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Illness Cases")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {illnessSeverity[1]}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {illnessSeverity[2]}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {illnessSeverity[3]}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Disability Cases")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {disabilitySeverity[1]}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {disabilitySeverity[2]}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {disabilitySeverity[3]}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    </Col>
                    {/* Request Details Section */}
                    <Col md={6}>
                      <Card style={{ marginBottom: "2px" }}>
                        <CardBody>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginBottom: "2px",
                              color: "#000",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("Request Details")}
                          </div>
                          <Table
                            bordered
                            responsive
                            style={{
                              borderColor: "#343a40",
                              margin: "auto",
                            }}
                          >
                            <tbody>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Applicant")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {headOfFamily ? (
                                    `${headOfFamily.first_name} ${headOfFamily.last_name}`
                                  ) : (
                                    <i
                                      className="fas fa-ban"
                                      style={{ color: "red" }}
                                    ></i>
                                  )}
                                </td>
                              </tr>
                              {/* <tr>
                                <td style={{ fontWeight: "bold" }}>
                                  {t("Father's Name")}:
                                </td>
                                <td>
                                  {headOfFamily
                                    ? headOfFamily.father_name || "0"
                                    : individuals.length > 0
                                    ? individuals.reduce(
                                        (oldest, individual) => {
                                          return new Date(
                                            individual.date_of_birth
                                          ) < new Date(oldest.date_of_birth)
                                            ? individual
                                            : oldest;
                                        }
                                      ).father_name || "0"
                                    : "0"}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: "bold" }}>
                                  {t("Mother's Name")}:
                                </td>
                                <td>
                                  {headOfFamily ? (
                                    headOfFamily.mother_name || "0"
                                  ) : (
                                    <i className="fas fa-ban"></i>
                                  )}
                                </td>
                              </tr> */}
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Volunteer Name")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {individuals.length > 0 ? (
                                    individuals[0].volunteer_name
                                  ) : (
                                    <i
                                      className="fas fa-ban"
                                      style={{ color: "red" }}
                                    ></i>
                                  )}
                                </td>
                              </tr>
                              {/* <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#333",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Request ID")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#333",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {individuals.length > 0 ? (
                                    individuals[0].last_updated_by_visit
                                  ) : (
                                    <i className="fas fa-ban"></i>
                                  )}
                                </td>
                              </tr> */}
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Request Date")}:
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {individuals.length > 0 ? (
                                    new Date(
                                      individuals[0].visit_date
                                    ).toLocaleDateString("en-CA")
                                  ) : (
                                    <i
                                      className="fas fa-ban"
                                      style={{ color: "red" }}
                                    ></i>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              marginBottom: "2px",
                              color: "#000",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("Age Categories")}
                          </div>
                          <Table
                            bordered
                            responsive
                            style={{
                              borderColor: "#343a40",
                              margin: "auto",
                            }}
                          >
                            <thead>
                              <tr style={{ borderColor: "#343a40" }}>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    textAlign: "left",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Category")}
                                </th>
                                <th
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "18px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Count")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Children under 2 years")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {underTwo}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Children over 2 years")}
                                </td>

                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {overTwo}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Adults (18 years and above)")}{" "}
                                 </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {adults}  
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Seniors (55 years and above)")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {seniors}
                                </td>
                              </tr>
                              <tr style={{ borderColor: "#343a40" }}>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {t("Total family members")}
                                </td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    borderColor: "#343a40",
                                  }}
                                >
                                  {individuals.length}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  {/* Signature Section */}
                  <div
                    style={{
                      borderTop: "1px solid #343a40",
                      marginTop: "20px",
                    }}
                  ></div>

                  <Row
                    className="justify-content-between"
                    style={{ marginTop: "20px", marginBottom: "70px" }}
                  >
                    <Col md={5} className="text-center">
                      <p
                        style={{
                          marginBottom: "10px",
                          fontWeight: "bold",
                          fontSize: "20px",
                          color: "#333",
                        }}
                      >
                        {t("Volunteer Name")}
                      </p>
                      <div
                        style={{
                          borderTop: "2px solid #343a40",
                          width: "100%",
                        }}
                      />
                    </Col>
                    <Col md={5} className="text-center">
                      <p
                        style={{
                          marginBottom: "10px",
                          fontWeight: "bold",
                          fontSize: "20px",
                          color: "#333",
                        }}
                      >
                        {t("Applicant and Signature")}
                      </p>
                      <div
                        style={{
                          borderTop: "2px solid #343a40",
                          width: "100%",
                        }}
                      />
                    </Col>
                  </Row>

                  {/* Uncomment this part if you want to enable the Emergency modal */}
                  {/* <Emergency
                    isOpen={isModalOpen}
                    toggle={() => setIsModalOpen(false)}
                    setDescription={(desc) => {
                      setDescription(desc);
                    }}
                  /> */}
                </CardBody>
              </Card>

              <div className="d-print-none">
                <div className="d-flex justify-content-center">
                  <Button color="success" onClick={() => downloadPDF()}>
                    <i className="fa fa-file-pdf"></i> {t("Download PDF")}
                  </Button>{" "}
                  {/* <Button color="primary" onClick={() => setIsModalOpen(true)}>
                      {t("Send")} </Button> */}
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FamilyReport;
