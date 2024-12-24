import React, { useEffect, useState } from "react";
import instance from "base_url";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Button, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import logoSm from "../../assets/images/logo-sm.png";
import Emergency from "./Emergency";
import { useTranslation } from "react-i18next";
import { MEDIA_URL } from "../../configs";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import pdfFile from "../../common/data/Emergency.pdf";

const ReportPage = () => {
  const { id, familyId } = useParams();
  const { t, i18n } = useTranslation();
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState({});
  const [family, setFamily] = useState({});
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rentAmount, setRentAmount] = useState(0);
  const [isRedCrescent, setIsRedCrescent] = useState(null);
  const [redCrescent, setRedCrescent] = useState(null);
  const [totalBills, setTotalBills] = useState(0);
  const [income, setIncome] = useState(0);
  const [applicant, setApplicant] = useState("");

  // Fetch family and individual data
  const fetchFamilyIndividuals = async () => {
    try {
      const { data } = await instance.get(`/families/${familyId}/`);
      setIndividuals(data.individuals || []);
      setFamily(data); // Save family data

      // Find the head of family
      const head = data.individuals.find((ind) => ind.is_head_of_family);
      setHeadOfFamily(head); // Save the head of family

      const redCrescent = data.incomes?.find(
        (item) => item.title?.item_name === "Red Crescent"
      );
      setRedCrescent(redCrescent);
      if (redCrescent && redCrescent.amount == 0) {
        setIsRedCrescent("No");
      } else {
        setIsRedCrescent("Yes");
      }

      const rent = data.expenses?.find(
        (item) => item.title?.item_name === "Rent Amount"
      );

      setRentAmount(rent?.amount || 0);
    } catch (error) {
      console.error("Error fetching family data:", error);
    } finally {
      setLoading(false); // Ensure loading state is set to false after data fetching
    }
  };

  // Fetch emergency details
  const getEmergencyDetails = async () => {
    try {
      const { data } = await instance.get(`/emergency-situation/${id}/`);
      setApplicant(data.applicant?.name || t("Family"));
      setEmergency(data);
    } catch (error) {
      console.error("Error fetching emergency data:", error);
    }
  };

  // Use useEffect to fetch data when the component loads
  useEffect(() => {
    fetchFamilyIndividuals();
    getEmergencyDetails();
  }, [id, familyId]);
  console.log("Family Data:", family);

  // Function to download PDF
  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    const buttons = document.querySelectorAll(".d-print-none");

    // Hide the buttons during the PDF generation process
    buttons.forEach((button) => (button.style.display = "none"));

    // Wait for all images to load
    const images = input.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    });

    await Promise.all(promises);

    // Capture the content as a canvas
    const canvas = await html2canvas(input, { useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // Create a new PDF document
    const newPdf = await PDFDocument.create();
    const pdfWidth = 595.28; // A4 width in points
    const pdfHeight = 841.89; // A4 height in points

    // Add the captured content to the first page
    const firstPage = newPdf.addPage([pdfWidth, pdfHeight]);
    const pngImage = await newPdf.embedPng(imgData);
    firstPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pdfWidth,
      height: pdfHeight,
    });

    // Fetch the existing PDF file
    const existingPdfBytes = await fetch(pdfFile).then((res) =>
      res.arrayBuffer()
    );
    const existingPdfDoc = await PDFDocument.load(existingPdfBytes);

    // Copy the pages from the existing PDF to the new PDF
    const copiedPages = await newPdf.copyPages(
      existingPdfDoc,
      existingPdfDoc.getPageIndices()
    );

    // Add copied pages to the new PDF
    copiedPages.forEach((page) => {
      newPdf.addPage(page);
    });

    // Save the merged PDF
    const mergedPdfBytes = await newPdf.save();
    const headOfFamilyName = headOfFamily
      ? `${headOfFamily.first_name}_${headOfFamily.last_name}`
      : "Unknown";
    const fileName = `${t("Emergency")}_${headOfFamilyName}.pdf`;

    // Create a blob and trigger the download
    const finalPdfBlob = new Blob([mergedPdfBytes], {
      type: "application/pdf",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(finalPdfBlob);
    link.download = fileName;
    link.click();

    // Restore the buttons after the PDF generation
    buttons.forEach((button) => (button.style.display = "block"));
  };

  const isRTL = i18n.language === "ar";

  return (
    <React.Fragment>
      <div className="page-content" dir={isRTL ? "rtl" : "ltr"}>
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={5}>
                <h6 className="page-title">{t("Emergency Report")}</h6>
              </Col>
            </Row>
          </div>
          <Row>
            <div className="col-15">
              <Card>
                <CardBody id="pdf-content">
                  {/* The title section contains the order number and logo image */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{ fontSize: "14px" }}>
                      <h4 style={{ margin: 0, fontSize: "16px" }}>
                        <strong>
                          {t("Request Number")}: {id}
                        </strong>
                      </h4>
                      <p style={{ fontSize: "14px" }}>
                        <strong>{t("Request Date")}:</strong>{" "}
                        {new Date(emergency.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            day: "numeric",
                            month: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <h3 style={{ marginTop: 0, fontSize: "18px" }}>
                      <img src={logoSm} alt="logo" height="30" />
                    </h3>
                  </div>
                  <hr style={{ marginTop: "1px" }} />

                  {/* Information section, divided into two parts with a longitudinal line */}
                  <Row
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Col md={6}>
                      <div
                        style={{
                          fontSize: "18px",
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
                          width: "95%",
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
                              {applicant ? (
                                applicant
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
                                    (ind) => ind.id === headOfFamily.partner_id
                                  ).first_name
                                } ${
                                  individuals.find(
                                    (ind) => ind.id === headOfFamily.partner_id
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
                              {t("Family Members")}:
                            </td>
                            <td
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                fontSize: "18px",
                                borderColor: "#343a40",
                              }}
                            >
                              {family?.individuals?.length || 0}
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
                              {!rentAmount ? (
                                <i
                                  className="fas fa-ban"
                                  style={{ color: "red" }}
                                ></i>
                              ) : (
                                Math.floor(rentAmount)
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
                                      <i
                                        className="fas fa-ban"
                                        style={{ color: "red" }}
                                      ></i>
                                    )}
                                  </span>
                                </>
                              ) : isRedCrescent === "No" ? (
                                <>
                                  {t("No")} : &nbsp;
                                  <span style={{ fontWeight: "bold" }}>
                                    {redCrescent?.additional_info?.reason || (
                                      <i
                                        className="fas fa-ban"
                                        style={{ color: "red" }}
                                      ></i>
                                    )}
                                  </span>
                                </>
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
                              {family.expenses_summary?.remaining ? (
                                Math.floor(family.expenses_summary?.remaining)
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
                              {family.expenses_summary?.total_bills || (
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
                    </Col>

                    <Col md={6}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          marginBottom: "1px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#333",
                            textTransform: "uppercase",
                            marginRight: "10px",
                          }}
                        >
                          {t("Request Type")} :
                        </div>
                        <p
                          style={{
                            fontSize: "16px",
                            color: "#007bff",
                            fontWeight: "600",
                          }}
                        >
                          {emergency.support_category ? (
                            t(emergency.support_category).toUpperCase()
                          ) : (
                            <i
                              className="fas fa-ban"
                              style={{ color: "red" }}
                            ></i>
                          )}
                        </p>
                      </div>
                      <div style={{ marginTop: "5px", width: "100%" }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginBottom: "2px",
                            color: "#333",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("Request Description")}
                        </div>
                        <div
                          style={{
                            padding: "15px",
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9",
                            color: "#555",
                            fontSize: "16px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {emergency.description
                            ? emergency.description.includes("Details:")
                              ? emergency.description
                                  .split("Details:")[1]
                                  .trim()
                              : emergency.description
                            : t("No details available.")}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div
                    style={{
                      borderTop: "2px solid #ddd",
                      margin: "10px 0",
                    }}
                  ></div>

                  {/* Family Tree Section */}
                  <div className="col-12 mt-4">
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "2px",
                        color: "#333",
                        textTransform: "uppercase",
                      }}
                    >
                      <h4>{t("Family Tree")}</h4>
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
                        style={{
                          width: "70%",
                          height: "auto",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: "2px solid #ddd",
                      margin: "10px 0",
                    }}
                  ></div>

                  {/* Individual information table */}
                  <Row>
                    <div className="col-12">
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          marginBottom: "2px",
                          color: "#333",
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
                              {t("Date of Birth")}
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
                                    {headOfFamily.date_of_birth || (
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
                                    {headOfFamily.job_title || (
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
                                        <strong> ({t("Wife's")})</strong>
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
                                      {individual.date_of_birth || (
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
                                      {individual.job_title || (
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

export default ReportPage;
