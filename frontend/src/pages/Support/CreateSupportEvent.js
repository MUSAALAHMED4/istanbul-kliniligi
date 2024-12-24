import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  TabContent,
  TabPane,
  NavItem,
  NavLink,
} from "reactstrap";
import instance from "base_url";
import { useTranslation } from "react-i18next";
import { validateRequiredFields, setErrorFn } from "../Utility/Functions";
import $ from "jquery";
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";

export default function EventCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [supportTypes, setSupportTypes] = useState([]);
  const [name, setName] = useState("");
  const [supportType, setSupportType] = useState("");
  const [distributionDays, setDistributionDays] = useState([
    { day: "", shifts: [{ start: "", end: "", queues: [{ volunteers: [] }] }] },
  ]);
  const [queues, setQueues] = useState([{ volunteers: [], families: [] }]);
  const [budget, setBudget] = useState(null);
  const [numberOfFamilies, setNumberOfFamilies] = useState("");
  const [numberOfFamiliesPerShift, setNumberOfFamiliesPerShift] = useState("");
  const [numberOfFamiliesPerQueue, setNumberOfFamiliesPerQueue] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [volunteerMap, setVolunteerMap] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const [errorFields, setErrorFields] = useState([]);
  const [selectedShiftQueueVolunteers, setSelectedShiftQueueVolunteers] =
    useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fields_tabs_mapping = {
    1: ["name", "supportType", "budget"],
    2: ["distributionDays"],
  };
  const setError = (isError, msg) => {
    setErrorOccurred(isError);
    setErrMsg(msg);
  };
  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  const fetchSupportTypes = async () => {
    try {
      const { data } = await instance.get("/support-type/");
      setSupportTypes(data.results);
      setError(false, "");
    } catch (e) {
      console.error(t("Error fetching support types:"), e);
      setError(true, e.message);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data } = await instance.get("/volunteers/");
      setVolunteers(data.results);
      data.results.forEach((volunteer) => {
        volunteerMap[volunteer.id] = volunteer.individual.name;
      });
      setVolunteerMap(volunteerMap);
      setError(false, "");
    } catch (e) {
      console.error(t("Error fetching volunteers:"), e);
      setError(true, e.message);
    }
  };

  useEffect(() => {
    fetchSupportTypes();
    fetchVolunteers();
  }, []);

  // Re-initialize select2 when distributionDays changes
  useEffect(() => {
    // Safely destroy select2 if it is already initialized
    $(".select2").each(function () {
      if ($(this).data("select2")) {
        $(this).select2("destroy");
      }
    });

    // Re-initialize select2 on the newly generated selects
    $(".select2").select2({
      placeholder: t("Select Volunteers"),
      allowClear: true,
    });

    $(".select2").on("change.select2", function (e) {
      const selectedValues = $(this).val(); // Get selected values

      // Retrieve custom data attributes for each select
      const dayIndex = $(this).data("day-index");
      const shiftIndex = $(this).data("shift-index");
      const selectType = $(this).data("select-type");
      const queueIndex = $(this).data("queue-index");

      // Apply logic based on which select was changed
      if (selectType === "queue") {
        // Logic for Queue select
        handleQueueVolunteerChange(
          dayIndex,
          shiftIndex,
          queueIndex,
          selectedValues
        );
      } else if (typeof shiftIndex !== "undefined") {
        // Logic for Shift select
        handleShiftVolunteerChange(dayIndex, shiftIndex, selectedValues);
      }
    });
  }, [distributionDays, volunteers]);

  const handleQueueVolunteerChange = (
    dayIndex,
    shiftIndex,
    queueIndex,
    value
  ) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues[queueIndex].volunteers = value;
    setDistributionDays(newDays);
    // append selected volunteers to selectedShiftQueueVolunteers
    const key = `${dayIndex}-${shiftIndex}`;
    // if key exists, add value to the array else create a new key with the value array
    if (key in selectedShiftQueueVolunteers) {
      selectedShiftQueueVolunteers[key].push(value);
    } else {
      selectedShiftQueueVolunteers[key] = [value];
    }
  };

  const handleShiftVolunteerChange = (dayIndex, shiftIndex, value) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].volunteers = value;
    setDistributionDays(newDays);
  };

  const handleDayChange = (index, value) => {
    const newDays = [...distributionDays];
    newDays[index].day = value;
    setDistributionDays(newDays);
  };

  const handleShiftChange = (dayIndex, shiftIndex, field, value) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex][field] = value;
    setDistributionDays(newDays);
  };

  const handleQueueChange = (
    dayIndex,
    shiftIndex,
    queueIndex,
    field,
    value
  ) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues[queueIndex][field] = value;
    setDistributionDays(newDays);
  };

  const addShift = (index) => {
    const newDays = [...distributionDays];
    newDays[index].shifts.push({
      start: "",
      end: "",
      queues: [{ volunteers: [] }],
    });
    setDistributionDays(newDays);
  };

  const removeShift = (dayIndex, shiftIndex) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts.splice(shiftIndex, 1);
    setDistributionDays(newDays);
  };

  const addQueue = (dayIndex, shiftIndex) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues.push({ volunteers: [] });
    setDistributionDays(newDays);
  };

  const removeQueue = (dayIndex, shiftIndex, queueIndex) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues.splice(queueIndex, 1);
    setDistributionDays(newDays);
  };

  const addDay = () => {
    setDistributionDays([
      ...distributionDays,
      {
        day: "",
        shifts: [{ start: "", end: "", queues: [{ volunteers: [] }] }],
      },
    ]);
  };

  const removeDay = (index) => {
    const newDays = distributionDays.filter((_, i) => i !== index);
    setDistributionDays(newDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return;

    const isInvalidForm = validateRequiredFields();
    if (isInvalidForm) {
      return;
    }

    const payload = {
      name,
      support_type: supportType,
      distribution_days: distributionDays,
      budget,
      number_of_families: numberOfFamilies,
      number_of_families_per_shift: numberOfFamiliesPerShift,
      number_of_families_per_queue: numberOfFamiliesPerQueue,
    };
    console.log("payload:", payload);
    try {
      const res = await instance.post("/event/create/", payload);
      navigate("/events");
    } catch (e) {
      console.error(t("Error creating event:"), e);
    }
  };

  console.log(selectedShiftQueueVolunteers);

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
                <h6 className="page-title">{t("Support Type Detail Page")}</h6>
              </Col>
            </Row>

            {/* Navigation Tabs */}
            <div
              className="form-wizard-wrapper wizard clearfix"
              style={{ marginBottom: "20px" }}
            >
              <div className="steps clearfix ">
                <ul>
                  {/* Basic Information  */}
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
                        {t("Basic Information")}
                      </span>
                    </NavLink>
                  </NavItem>
                  {/* Distribution and Shifts*/}
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
                        {t("Distribution and Shifts")}
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
                    {/* Basic Information */}
                    <TabPane tabId={1}>
                      <Form onSubmit={handleSubmit}>
                        <Row>
                          <Col md={6}>
                            <Row>
                              <FormGroup>
                                <Label for="name">{t("Event Name")}</Label>
                                <Input
                                  type="text"
                                  name="name"
                                  id="name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  required
                                />
                              </FormGroup>
                            </Row>
                          </Col>
                          <Col md={6}>
                            <Row>
                              <FormGroup>
                                <Label for="supportType">
                                  {t("Support Type")}
                                </Label>
                                <Input
                                  type="select"
                                  name="supportType"
                                  id="supportType"
                                  value={supportType}
                                  onChange={(e) =>
                                    setSupportType(e.target.value)
                                  }
                                  required
                                >
                                  <option value="">
                                    {t("Select Support Type")}
                                  </option>
                                  {supportTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </Input>
                              </FormGroup>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="budget">{t("Budget")}</Label>
                              <Input
                                type="number"
                                name="budget"
                                id="budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                              />
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="numberOfFamilies">
                                {t("Number of Families")}
                              </Label>
                              <Input
                                type="number"
                                name="numberOfFamilies"
                                id="numberOfFamilies"
                                value={numberOfFamilies}
                                onChange={(e) =>
                                  setNumberOfFamilies(e.target.value)
                                }
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="numberOfFamiliesPerShift">
                                {t("Number of Families Per Shift")}
                              </Label>
                              <Input
                                type="number"
                                name="numberOfFamiliesPerShift"
                                id="numberOfFamiliesPenShift"
                                value={numberOfFamiliesPerShift}
                                onChange={(e) =>
                                  setNumberOfFamiliesPerShift(e.target.value)
                                }
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="numberOfFamiliesPerShift">
                                {t("Number of Families Per Queue")}
                              </Label>
                              <Input
                                type="number"
                                name="numberOfFamiliesPerQueue"
                                id="numberOfFamiliesPenQueue"
                                value={numberOfFamiliesPerQueue}
                                onChange={(e) =>
                                  setNumberOfFamiliesPerQueue(e.target.value)
                                }
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
                    </TabPane>
                    {/* Distribution Days and Shifts */}
                    <TabPane tabId={2}>
                      <FormGroup>
                        {distributionDays.map((day, dayIndex) => (
                          <div key={dayIndex}>
                            <Row className="mb-3">
                              <Col md={3}>
                                <Label>{t("Day")}</Label>
                                <Input
                                  type="date"
                                  max="9999-12-31"
                                  value={day.day}
                                  onChange={(e) =>
                                    handleDayChange(dayIndex, e.target.value)
                                  }
                                  required
                                />
                                {distributionDays.length > 1 && (
                                  <Button
                                    color="danger"
                                    className="mt-2"
                                    onClick={() => removeDay(dayIndex)}
                                  >
                                    {t("Remove Day")}
                                  </Button>
                                )}
                              </Col>
                              <Col md={9}>
                                {day.shifts.map((shift, shiftIndex) => (
                                  <div key={shiftIndex}>
                                    <Row className="mb-2">
                                      <Col md={4}>
                                        <Label>{t("Start Time")}</Label>
                                        <Input
                                          type="time"
                                          placeholder={t("Start Time")}
                                          value={shift.start}
                                          onChange={(e) =>
                                            handleShiftChange(
                                              dayIndex,
                                              shiftIndex,
                                              "start",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />
                                      </Col>
                                      <Col md={4}>
                                        <Label>{t("End Time")}</Label>
                                        <Input
                                          type="time"
                                          placeholder={t("End Time")}
                                          value={shift.end}
                                          onChange={(e) =>
                                            handleShiftChange(
                                              dayIndex,
                                              shiftIndex,
                                              "end",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />
                                      </Col>
                                      <Col md={4}>
                                        <Label>{t("Period")}</Label>
                                        <Input
                                          type="select"
                                          value={shift.period || ""}
                                          onChange={(e) =>
                                            handleShiftChange(
                                              dayIndex,
                                              shiftIndex,
                                              "period",
                                              e.target.value
                                            )
                                          }
                                          required
                                        >
                                          <option value="">
                                            {t("Select Period")}
                                          </option>
                                          <option value="morning">
                                            {t("Morning")}
                                          </option>
                                          <option value="evening">
                                            {t("Evening")}
                                          </option>
                                        </Input>
                                      </Col>
                                      <Col md={4}>
                                        {day.shifts.length > 1 && (
                                          <Button
                                            color="danger"
                                            onClick={() =>
                                              removeShift(dayIndex, shiftIndex)
                                            }
                                          >
                                            -
                                          </Button>
                                        )}
                                      </Col>
                                    </Row>

                                    <Row className="mb-3">
                                      <Col md={12}>
                                        <Label>
                                          {t("Select Volunteers for Shift")}
                                        </Label>
                                        <select
                                          className="select2"
                                          data-day-index={dayIndex}
                                          data-shift-index={shiftIndex}
                                          data-select-type="shift"
                                          multiple
                                          value={shift.volunteers || []}
                                          onChange={(e) =>
                                            handleShiftVolunteerChange(
                                              dayIndex,
                                              shiftIndex,
                                              [].slice
                                                .call(e.target.selectedOptions)
                                                .map((item) => item.value)
                                            )
                                          }
                                          style={{ width: "100%" }}
                                        >
                                          {volunteers.map((volunteer) => (
                                            <option
                                              key={volunteer.id}
                                              value={volunteer.id}
                                            >
                                              {volunteer.individual.name}
                                            </option>
                                          ))}
                                        </select>
                                      </Col>
                                    </Row>

                                    <FormGroup>
                                      <Label>{t("Queues")}</Label>
                                      {shift.queues.map((queue, queueIndex) => (
                                        <div key={queueIndex}>
                                          <Row className="mb-2">
                                            <Col md={4}>
                                              <Label>
                                                {t(
                                                  "Select Volunteers for Queue"
                                                )}
                                              </Label>
                                              <select
                                                className="select2"
                                                data-day-index={dayIndex}
                                                data-shift-index={shiftIndex}
                                                data-queue-index={queueIndex}
                                                data-select-type="queue"
                                                multiple
                                                value={queue.volunteers || []}
                                                onChange={(e) =>
                                                  handleQueueVolunteerChange(
                                                    dayIndex,
                                                    shiftIndex,
                                                    queueIndex,
                                                    [].slice
                                                      .call(
                                                        e.target.selectedOptions
                                                      )
                                                      .map((item) => item.value)
                                                  )
                                                }
                                                style={{ width: "100%" }}
                                              >
                                                {/* {volunteers.map(volunteer => <option key={volunteer.id} value={volunteer.id}>{volunteer.individual.name}</option>)} */}
                                                {distributionDays[
                                                  dayIndex
                                                ].shifts[
                                                  shiftIndex
                                                ].volunteers?.map(
                                                  (volunteer_id) => {
                                                    // check if this volunteer is selected for another queue in this shift
                                                    let isVolunteerSelected = false;
                                                    distributionDays[
                                                      dayIndex
                                                    ].shifts[
                                                      shiftIndex
                                                    ].queues.forEach(
                                                      (queue, index) => {
                                                        if (
                                                          index !==
                                                            queueIndex &&
                                                          queue.volunteers.includes(
                                                            volunteer_id
                                                          )
                                                        ) {
                                                          isVolunteerSelected = true;
                                                        }
                                                      }
                                                    );
                                                    if (!isVolunteerSelected) {
                                                      return (
                                                        <option
                                                          key={volunteer_id}
                                                          value={volunteer_id}
                                                        >
                                                          {
                                                            volunteerMap[
                                                              volunteer_id
                                                            ]
                                                          }
                                                        </option>
                                                      );
                                                    } else {
                                                      return null;
                                                    }
                                                  }
                                                )}
                                                {/* filter volunteers based on shift volunteers */}
                                              </select>
                                            </Col>
                                            <Col md={4}>
                                              {shift.queues.length > 1 && (
                                                <Button
                                                  color="danger"
                                                  onClick={() =>
                                                    removeQueue(
                                                      dayIndex,
                                                      shiftIndex,
                                                      queueIndex
                                                    )
                                                  }
                                                >
                                                  -
                                                </Button>
                                              )}
                                            </Col>
                                          </Row>
                                        </div>
                                      ))}
                                      <Button
                                        color="primary"
                                        onClick={() =>
                                          addQueue(dayIndex, shiftIndex)
                                        }
                                      >
                                        {t("Add Queue")}
                                      </Button>
                                    </FormGroup>
                                  </div>
                                ))}
                                <Button
                                  color="primary"
                                  onClick={() => addShift(dayIndex)}
                                >
                                  {t("Add Shift")}
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))}
                        <Button color="primary" onClick={addDay}>
                          {t("Add Day")}
                        </Button>
                      </FormGroup>
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
                <Button color="primary" type="submit">
                  {t("Save")}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
