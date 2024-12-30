import React, { useState, useEffect } from "react";
import instance from "base_url";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  CardBody,
  Form,
} from "reactstrap";

import { withTranslation } from "react-i18next";
import Dropzone from "react-dropzone";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Autocomplete from "components/Common/Autocomplete";
import { MEDIA_URL } from "../../configs";
import { Tooltip } from "reactstrap";
import PrintModal from "./PrintModal";

const getEmergencyTypeOptions = (t) => [
  { value: "medical", label: t("Medical") },
  { value: "relief", label: t("Relief") },
];

const getStatusOptions = (t) => [
  { value: "pending", label: t("Pending") },
  { value: "processing", label: t("Processing") },
  { value: "approved", label: t("Approved") },
  { value: "rejected", label: t("Rejected") },
];

const createSupport = (t) => {
  alert(t("Support request created."));
};

function CreateEditEmergency({ t }) {
  const navigate = useNavigate();
  const { id, familyId } = useParams();
  const [activeTab, setActiveTab] = useState(1);
  const [errorFields, setErrorFields] = useState([]);
  const [emergency, setEmergency] = useState({});
  const [family, setFamily] = useState({});
  const [familyList, setFamilyList] = useState([]);
  const [individualList, setIndividualList] = useState([]);
  const [selectedSupportFiles, setSelectedSupportFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showStudyResult, setShowStudyResult] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(() => {
    const storedFile = localStorage.getItem("uploadedFile");
    return storedFile ? [JSON.parse(storedFile)] : [];
  });

  const [alert, setAlert] = useState({
    show: false,
    message: "",
    description: "",
    type: "",
  });

  const fields_tabs_mapping = {
    1: ["applicant_id"],
  };

  // Validate fields
  const validateFields = () => {
    const errorFields = [];
    const requiredFields = fields_tabs_mapping[activeTab] || [];

    requiredFields.forEach((field) => {
      if (!emergency[field] || emergency[field] === "") {
        errorFields.push(field);
      }
    });

    console.log("Error Fields:", errorFields);
    setErrorFields(errorFields);
    return errorFields.length === 0;
  };

  // Tab toggle
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isPrintDisabled, setIsPrintDisabled] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const checkMissingFields = (emergency, requiredFields, t) => {
    const missingFields = [];
    requiredFields.forEach((field) => {
      if (!emergency[field] || emergency[field] === "") {
        missingFields.push(t(field));
      }
    });
    return missingFields;
  };

  const requiredFieldsForPrint = ["applicant_id"];

  const handlePrintClick = () => {
    const missingFields = checkMissingFields(
      emergency,
      requiredFieldsForPrint,
      t
    );

    if (missingFields.length > 0) {
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 3000);
      return false;
    }

    return true;
  };

  const areAllFieldsComplete = () => {
    return requiredFieldsForPrint.every((field) => emergency[field]);
  };

  useEffect(() => {
    if (id) {
      getEmergencyDetails();
      getFamilies();
      getIndividuals();
    }
  }, [id]);

  useEffect(() => {
    if (emergency.status === "approved") {
      setShowStudyResult(true);
    } else {
      setShowStudyResult(false);
    }
  }, [emergency.status]);

  const getEmergencyDetails = async () => {
    try {
      const { data } = await instance.get(`/emergency-situation/${id}/`);
      console.log(data);
      data.family_id = data.family?.id || null;
      data.individual_id = data.individual?.id || null;
      data.individual_name = data.individual?.name || null;

      data.applicant_id = data.applicant?.id || null;
      data.applicant_name = data.applicant?.name || null;

      if (data.approved_request_file) {
        setSelectedFiles([
          {
            name: data.approved_request_file.split("/").pop(),
            preview: data.approved_request_file,
            type: "application/pdf",
          },
        ]);
      }
      console.log(data);
      setEmergency(data);
    } catch (error) {
      console.error(t("Error fetching emergency data:"), error);
    }
  };

  // get Families
  const getFamilies = async (search) => {
    try {
      let data = [];
      if (search) {
        const response = await instance.get(`/families/?search=${search}`);
        data = response.data;
      } else {
        const response = await instance.get("/families/");
        data = response.data;
      }
      setFamilyList(data.results);
    } catch (e) {
      console.log(e);
    }
  };

  // get Individuals
  const getIndividuals = async () => {
    try {
      const { data } = await instance.get(`/families/${familyId}/individuals/`);
      setIndividualList(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (id) {
      getEmergencyDetails();
      getFamilies();
      getIndividuals();
    }
  }, [id]);

  const saveEmergency = async (e, navigateTo) => {
    console.log(e, navigateTo, "========================");
    setIsSaving(true);
    if (
      !emergency.description ||
      !emergency.support_category ||
      !emergency.applicant_id
    ) {
      setAlert({
        show: true,
        message: t("Error"),
        description: t("Please fill in all required fields."),
        type: "error",
      });
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append form fields to FormData object
      formData.append("description", emergency.description);
      formData.append("support_category", emergency.support_category);
      formData.append("status", emergency.status || "pending");
      formData.append("family_id", emergency.family_id);
      formData.append("individual_id", emergency.individual_id);
      formData.append("applicant_id", emergency.applicant_id);

      // Append the file if a file is selected
      if (selectedFiles.length > 0 && selectedFiles[0] instanceof File) {
        formData.append("approved_request_file", selectedFiles[0]);
      } else {
        console.error("Selected file is not a valid File object");
      }

      if (selectedSupportFiles.length > 0) {
        selectedSupportFiles.forEach((file) => {
          formData.append("support_documents", file);
        });
      }

      // print formdata
      for (var pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }

      // await instance.put(`/emergency-situation/${id}/`, formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      await instance.put(`/emergency-situation/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (navigateTo) {
        navigate(navigateTo);
      } else {
        navigate(-1, { state: { activeTab: 4 } });
      }
      // setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error(error);
      setAlert({
        show: true,
        message: t("Error"),
        description: t("Failed to create emergency."),
        type: "error",
      });
    }
    setIsSaving(false);
  };

  const handleAcceptedFiles = (files) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    const validFiles = files.filter((file) => validTypes.includes(file.type));

    if (validFiles.length === 0) {
      setAlert({
        show: true,
        message: t("Error"),
        description: t(
          "Invalid file type. Please upload a PDF or JPG file only."
        ),
        type: "error",
      });
      return;
    }

    const formattedFile = validFiles[0];
    formattedFile.preview = URL.createObjectURL(formattedFile);
    setSelectedFiles([formattedFile]);
  };

  const updateField = (value, param) => {
    const newEmergency = { ...emergency };
    newEmergency[param] = value;
    setEmergency(newEmergency);
  };

  const updateEmergencyData = (value, param) => {
    const newEmergency = { ...emergency };
    var _value = value;

    if (param === "family_id") {
      _value = value ? value.id : null;
      newEmergency.family_id = _value;
    } else if (param === "individual_id") {
      newEmergency.individual_id = value ? value.id : null;
      newEmergency.individual_name = value ? value.name : null;
    } else if (param === "applicant_id") {
      newEmergency.applicant_id = value ? value.id : null;
      newEmergency.applicant_name = value ? value.name : null;
    } else {
      newEmergency[param] = value;
    }
    setEmergency(newEmergency);
  };

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
        return <></>;
    }
  };

  // Support Documents
  const handleSupportFiles = (files) => {
    // const validTypes = [
    //   "application/pdf",
    //   "image/jpeg",
    //   "image/jpg",
    //   "audio/mpeg",
    //   "video/mp4",
    // ];
    // const validFiles = files.filter((file) => validTypes.includes(file.type));
    const validFiles = files;

    if (validFiles.length === 0) {
      setAlert({
        show: true,
        message: t("Error"),
        description: t("Accepted all file types."),
        type: "error",
      });
      return;
    }

    // Check file size
    const formattedFiles = validFiles;
    formattedFiles.forEach((file) => {
      file.preview = URL.createObjectURL(file);
    });
    // formattedFile.preview = URL.createObjectURL(formattedFile);
    setSelectedSupportFiles(formattedFiles);
  };

  const dropzoneStyle = {
    border: "2px dashed #ced4da",
    borderRadius: "6px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    cursor: "pointer",
  };

  // Print Confirmation
  const handlePrintConfirmation = () => {
    // الانتقال إلى صفحة الطباعة
    setEmergency({ ...emergency, status: "processing" });
    console.log(emergency);
    saveEmergency(null, `/families/${familyId}/emergency/ReportPage/${id}`);
    // navigate(`/families/${familyId}/emergency/ReportPage/${id}`);
    setShowPrintModal(false);
  };
  return (
    <React.Fragment>
      <div className="page-content">
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
                <h6 className="page-title">
                  {id ? t("Edit Doctor Dashboard") : t("Doctor Dashboard")}
                </h6>{" "}
              </Col>
            </Row>

            {/* Navigation Tabs */}
            <div
              className="form-wizard-wrapper wizard clearfix"
              style={{ marginBottom: "20px" }}
            >
              <div className="steps clearfix ">
                <ul>
                  {/* Request Information  */}
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
                      <span
                        style={{
                          color: errorFields.some((x) =>
                            fields_tabs_mapping[1].includes(x)
                          )
                            ? "red"
                            : "inherit",
                        }}
                      >
                        {t("Prescription")}
                      </span>
                    </NavLink>
                  </NavItem>
                  {/* Emergency Details*/}
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
                      <span
                        style={{
                          color: errorFields.some((x) =>
                            fields_tabs_mapping[2].includes(x)
                          )
                            ? "red"
                            : "inherit",
                        }}
                      >
                        {t("Diagnosis")}
                      </span>
                    </NavLink>
                  </NavItem>
                  {/* Emergency Details*/}
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
                      <span
                        style={{
                          color: errorFields.some((x) =>
                            fields_tabs_mapping[3].includes(x)
                          )
                            ? "red"
                            : "inherit",
                        }}
                      >
                        {t("Tests")}
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
                      <div className="row mb-4">
                        <div className="col-md-2 col-12 align-content-center">
                          <p className="m-0">
                            <strong>{t("Patient's name")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <div className="d-flex w-100">
                            <div className="w-100 me-2 ">
                              {id ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  value={emergency.family?.title}
                                  disabled
                                />
                              ) : (
                                <Autocomplete
                                  name={t("family")}
                                  searchParam="title"
                                  placeholder={
                                    emergency.family?.title ||
                                    `${t("Select")} ${t("family")}`
                                  }
                                  searchMethod={getFamilies}
                                  list={familyList}
                                  selectedObject={(value) => {
                                    updateEmergencyData(value, "family_id");
                                  }}
                                  required={true}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-md-2 col-12 align-content-center">
                          <p className="m-0">{t("Medication Name")}</p>
                        </div>
                        <div className="col-4">
                          <div className="d-flex w-100">
                            <div className="w-100 me-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder={t("Enter medication name")}
                                onChange={(e) =>
                                  updateEmergencyData(
                                    e.target.value,
                                    "medication_name"
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Medication Type")}</strong>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control form-select"
                            value={emergency.medication_type}
                            onChange={(e) =>
                              updateEmergencyData(
                                e.target.value,
                                "medication_type"
                              )
                            }
                            required
                          >
                            <option value="">{t("Select Type")}</option>
                            <option value="pill">{t("Pill")}</option>
                            <option value="syrup">{t("Syrup")}</option>
                            <option value="injection">{t("Injection")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Instructions")}</strong>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control form-select"
                            value={emergency.instructions}
                            onChange={(e) =>
                              updateEmergencyData(
                                e.target.value,
                                "instructions"
                              )
                            }
                            required
                          >
                            <option value="">{t("Select Instructions")}</option>
                            <option value="after_meal">
                              {t("After Meal")}
                            </option>
                            <option value="before_meal">
                              {t("Before Meal")}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Description")}</strong>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="3"
                            value={emergency.description}
                            onChange={(e) =>
                              updateEmergencyData(e.target.value, "description")
                            }
                            required
                          ></textarea>
                        </div>
                      </div>
                      {/*  Support Documents F */}
                      <div className="row mb-4">
                        <div className="col-2">
                          <p className="m-0">
                            <strong>{t("Support Documents")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <Form>
                            <Dropzone onDrop={handleSupportFiles}>
                              {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()} style={dropzoneStyle}>
                                  <input {...getInputProps()} />
                                  <i className="mdi mdi-cloud-upload me-2 text-muted"></i>
                                  <span>
                                    {t("Drop files here or click to upload.")}
                                  </span>
                                </div>
                              )}
                            </Dropzone>
                          </Form>

                          <p className="text-danger mt-1 mb-0">
                            {t("All file types are supported.")}
                          </p>

                          <div className="mt-2">
                            {selectedSupportFiles.length > 0 ? (
                              <div>
                                <strong>{t("Uploaded Files:")}</strong>{" "}
                                {selectedSupportFiles.map((file, index) => (
                                  <a
                                    href={file.preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary"
                                    style={{ marginRight: "10px" }}
                                  >
                                    {file.name}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted mb-0">
                                {emergency.support_documents ? (
                                  <a
                                    target="_blank"
                                    href={emergency.support_documents}
                                  >
                                    Download Support Documents
                                  </a>
                                ) : (
                                  t("No file uploaded yet.")
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Save Button */}
                        <div
                          className="d-flex align-items-center gap-3 mt-3"
                          style={{ justifyContent: "flex-start" }}
                        >
                          <button
                            id="printButton"
                            className="btn btn-secondary"
                            onClick={() =>
                              setShowPrintModal(handlePrintClick())
                            }
                            disabled={!isPrintDisabled}
                            onMouseOver={() => {
                              if (!areAllFieldsComplete()) {
                                setTooltipOpen(true);
                              }
                            }}
                            onMouseOut={() => setTooltipOpen(false)}
                          >
                            <i className="mdi mdi-printer me-2"></i>
                            {t("Print")}
                          </button>
                          <PrintModal
                            isVisible={showPrintModal}
                            onConfirm={handlePrintConfirmation}
                            onCancel={() => setShowPrintModal(false)}
                            t={t}
                          />

                          <Tooltip
                            placement="bottom"
                            isOpen={!areAllFieldsComplete() && tooltipOpen}
                            target="printButton"
                            fade={true}
                          >
                            {t("Please complete the following fields:") +
                              " " +
                              checkMissingFields(
                                emergency,
                                requiredFieldsForPrint,
                                t
                              )
                                .map((field) => {
                                  const fieldMapping = {
                                    applicant_id: t("Applicant"),
                                  };
                                  return fieldMapping[field] || field;
                                })
                                .join(", ")}
                          </Tooltip>
                        </div>
                      </div>
                    </TabPane>
                    {/* Family Salaries */}
                    <TabPane tabId={2}>
                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Blood Type")}</strong>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control form-select"
                            value={emergency.blood_type}
                            onChange={(e) =>
                              updateEmergencyData(e.target.value, "blood_type")
                            }
                            required
                          >
                            <option value="">{t("Select Blood Type")}</option>
                            <option value="A+">{t("A+")}</option>
                            <option value="A-">{t("A-")}</option>
                            <option value="B+">{t("B+")}</option>
                            <option value="B-">{t("B-")}</option>
                            <option value="AB+">{t("AB+")}</option>
                            <option value="AB-">{t("AB-")}</option>
                            <option value="O+">{t("O+")}</option>
                            <option value="O-">{t("O-")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Symptoms")}</strong>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder={t("Enter symptoms")}
                            onChange={(e) =>
                              updateEmergencyData(e.target.value, "symptoms")
                            }
                          ></textarea>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Chief Complaint")}</strong>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder={t("Enter chief complaint")}
                            onChange={(e) =>
                              updateEmergencyData(
                                e.target.value,
                                "chief_complaint"
                              )
                            }
                          ></textarea>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Final Diagnosis")}</strong>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder={t("Enter final diagnosis")}
                            onChange={(e) =>
                              updateEmergencyData(
                                e.target.value,
                                "final_diagnosis"
                              )
                            }
                          ></textarea>
                        </div>
                      </div>

                      {/* Decision Upload   */}
                      <div className="row mb-4">
                        <div className="col-2">
                          <p className="m-0">
                            <strong>{t("Decision Upload")}</strong>
                          </p>
                        </div>
                        <div className="col-4">
                          <Form>
                            <Dropzone onDrop={handleAcceptedFiles}>
                              {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()} style={dropzoneStyle}>
                                  <input {...getInputProps()} />
                                  <i className="mdi mdi-cloud-upload me-2 text-muted"></i>
                                  <span>
                                    {t("Drop files here or click to upload.")}
                                  </span>
                                </div>
                              )}
                            </Dropzone>
                          </Form>
                          <p className="text-danger mt-1 mb-0">
                            {t("Only PDF and JPG files are allowed.")}
                          </p>
                          <div className="mt-2">
                            {selectedFiles.length > 0 ? (
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  <strong>{t("Uploaded File:")}</strong>
                                  <a
                                    href={selectedFiles[0].preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "blue",
                                      textDecoration: "underline",
                                      margin: 0,
                                    }}
                                  >
                                    {decodeURIComponent(selectedFiles[0].name)}
                                  </a>
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                  {selectedFiles[0].type ===
                                  "application/pdf" ? (
                                    <iframe
                                      src={selectedFiles[0].preview}
                                      width="100%"
                                      height="350px"
                                      style={{ border: "1px solid #ced4da" }}
                                    ></iframe>
                                  ) : (
                                    <img
                                      src={selectedFiles[0].preview}
                                      alt="uploaded file"
                                      style={{
                                        width: "100%",
                                        maxHeight: "350px",
                                        objectFit: "contain",
                                        border: "1px solid #ced4da",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted mb-0">
                                {t("No file uploaded yet.")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId={3}>
                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Test Type")}</strong>
                        </div>
                        <div className="col-4">
                          <select
                            className="form-control form-select"
                            value={emergency.test_type}
                            onChange={(e) =>
                              updateEmergencyData(e.target.value, "test_type")
                            }
                            required
                          >
                            <option value="">{t("Select Test Type")}</option>
                            <option value="blood_test">
                              {t("Blood Test")}
                            </option>
                            <option value="urine_test">
                              {t("Urine Test")}
                            </option>
                            <option value="x_ray">{t("X-Ray")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Test Results")}</strong>
                        </div>
                        <div className="col-4">
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder={t("Enter test results")}
                            onChange={(e) =>
                              updateEmergencyData(
                                e.target.value,
                                "test_results"
                              )
                            }
                          ></textarea>
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-2">
                          <strong>{t("Test Date")}</strong>
                        </div>
                        <div className="col-4">
                          <input
                            type="date"
                            className="form-control"
                            value={emergency.test_date}
                            onChange={(e) =>
                              updateEmergencyData(e.target.value, "test_date")
                            }
                          />
                        </div>
                      </div>
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
                  className={activeTab === 3 ? "next disabled" : "next"}
                  onClick={() => toggleTab(activeTab + 1)}
                >
                  {t("Next")}
                </Button>
              </div>
              <div>
                <Button
                  color="primary"
                  onClick={saveEmergency}
                  disabled={isSaving}
                >
                  <i className="mdi mdi-content-save me-2"></i>
                  {isSaving ? t("Saving...") : t("Save")}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default withTranslation()(CreateEditEmergency);
