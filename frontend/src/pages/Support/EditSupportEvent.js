import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import instance from 'base_url';
import { set } from 'lodash';
import { useTranslation } from 'react-i18next';
import { validateRequiredFields } from '../Utility/Functions';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2/dist/js/select2.min.js';


export default function EditSupportEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [supportTypes, setSupportTypes] = useState([]);
  const [name, setName] = useState('');
  const [supportType, setSupportType] = useState('');
  const [distributionDays, setDistributionDays] = useState([{ day: '', shifts: [{ start: '', end: '', queues: [{ volunteers: [] }] }] }]);
  const [queues, setQueues] = useState([{ volunteers: [], families: [] }]);
  const [budget, setBudget] = useState(null);
  const [numberOfFamilies, setNumberOfFamilies] = useState('');
  const [numberOfFamiliesPerShift, setNumberOfFamiliesPerShift] = useState('');
  const [numberOfFamiliesPerQueue, setNumberOfFamiliesPerQueue] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [volunteerMap, setVolunteerMap] = useState({});

  const setError = (isError, msg) => {
      setErrorOccurred(isError);
      setErrMsg(msg);
  };

  const fetchSupportTypes = async () => {
    try {
      const { data } = await instance.get('/support-type/');
      setSupportTypes(data.results);
      setError(false, '');
    } catch (e) {
      console.error('Error fetching support types:', e);
      setError(true, e.message);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const { data } = await instance.get('/volunteers/');
      setVolunteers(data.results);
      data.results.forEach(volunteer => {
        volunteerMap[volunteer.id] = volunteer.individual.name;
      });
      setVolunteerMap(volunteerMap);
      setError(false, '');
    } catch (e) {
      console.error('Error fetching volunteers:', e);
      setError(true, e.message);
    }
  };

  const fetchEventData = async () => {
    try {
      const { data } = await instance.get(`/event/${id}/`);
      console.log(data)
      setName(data.name);
      setSupportType(data.support_type.id);
      setDistributionDays(data.distribution_days);
      setBudget(data.budget);
      setNumberOfFamilies(data.number_of_families);
      setNumberOfFamiliesPerShift(data.number_of_families_per_shift);
      setNumberOfFamiliesPerQueue(data.rows_per_page);
      setError(false, '');
    } catch (e) {
      console.error('Error fetching event data:', e);
      setError(true, e.message);
    }
  };

  useEffect(() => {
    fetchSupportTypes();
    fetchVolunteers();
    fetchEventData();
  }, []);

  // Re-initialize select2 when distributionDays changes
  useEffect(() => {
    // Safely destroy select2 if it is already initialized
    $('.select2').each(function () {
      if ($(this).data('select2')) {
        $(this).select2('destroy');
      }
    });
    
    // Re-initialize select2 on the newly generated selects
    $('.select2').select2({
      placeholder: t("Select Volunteers"),
      allowClear: true,
    });

    $('.select2').on('change.select2', function (e) {
      const selectedValues = $(this).val(); // Get selected values
  
      // Retrieve custom data attributes for each select
      const dayIndex = $(this).data('day-index');
      const shiftIndex = $(this).data('shift-index');
      const selectType = $(this).data('select-type');
      const queueIndex = $(this).data('queue-index');
  
      // Apply logic based on which select was changed
      if (selectType === 'queue') {
        // Logic for Queue select
        handleQueueVolunteerChange(dayIndex, shiftIndex, queueIndex, selectedValues);
      } else if (typeof shiftIndex !== 'undefined') {
        // Logic for Shift select
        handleShiftVolunteerChange(dayIndex, shiftIndex, selectedValues);
      }
    });
  }, [distributionDays, volunteers]);

  const handleQueueVolunteerChange = (dayIndex, shiftIndex, queueIndex, value) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues[queueIndex].volunteers = value;
    setDistributionDays(newDays);
  };

  const handleShiftVolunteerChange = (dayIndex, shiftIndex, value) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].volunteers = value;
    setDistributionDays(newDays);
  };

  const validateForm = () => {
    let totalShifts = 0;
    distributionDays.forEach(day => {
      totalShifts += day.shifts.length;
    });
    
    if (numberOfFamilies > totalShifts * numberOfFamiliesPerShift) {
      setError(true, 'Number of families cannot be more than the number of families per shift');
      return false;
    }
    
    return true;
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

  const handleQueueChange = (dayIndex, shiftIndex, queueIndex, field, value) => {
    const newDays = [...distributionDays];
    newDays[dayIndex].shifts[shiftIndex].queues[queueIndex][field] = value;
    setDistributionDays(newDays);
  };

  const addShift = (index) => {
    const newDays = [...distributionDays];
    newDays[index].shifts.push({ start: '', end: '', queues: [{ volunteers: [] }] });
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
    setDistributionDays([...distributionDays, { day: '', shifts: [{ start: '', end: '', queues: [{ volunteers: [] }] }] }]);
  };

  const removeDay = (index) => {
    const newDays = distributionDays.filter((_, i) => i !== index);
    setDistributionDays(newDays);
  };

  const handleSubmit = async (e) => {
    const isInvalidForm = validateRequiredFields();
    if (isInvalidForm) {
      return
    }
    e.preventDefault();
    // if (!validateForm()) return;

    const payload = { name, 
                      support_type: supportType, 
                      distribution_days: distributionDays, 
                      budget, 
                      number_of_families: numberOfFamilies, 
                      number_of_families_per_shift: numberOfFamiliesPerShift, 
                      number_of_families_per_queue: numberOfFamiliesPerQueue 
                    };
    console.log('payload:', payload);
    try {
      const res = await instance.put(`/event/${id}/edit/`, payload);
      navigate('/events');
    } catch (e) {
      console.error('Error updating event:', e);
    }
  };

  console.log('distributionDays:', distributionDays);

  return (
    <div className="page-content">
        <Container fluid>
        {
          errorOccurred &&
          <div className="alert alert-danger" role="alert">
            {t(errMsg)}
          </div>
        }
        <h4 className='my-4'>{t('Edit Event')}</h4>
        <Card>
            <CardBody>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Row>
                        <FormGroup>
                        <Label for="name">{t('Event Name')}</Label>
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
                        <Label for="supportType">{t('Support Type')}</Label>
                        <Input
                            type="select"
                            name="supportType"
                            id="supportType"
                            value={supportType}
                            onChange={(e) => setSupportType(e.target.value)}
                            required
                        >
                            <option value="">{t('Select Support Type')}</option>
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
                        <Label for="budget">{t('Budget')}</Label>
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
                        <Label for="numberOfFamilies">{t('Number of Families')}</Label>
                        <Input
                            type="number"
                            name="numberOfFamilies"
                            id="numberOfFamilies"
                            value={numberOfFamilies}
                            onChange={(e) => setNumberOfFamilies(e.target.value)}
                        />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                        <Label for="numberOfFamiliesPerShift">{t('Number of Families Per Shift')}</Label>
                        <Input
                            type="number"
                            name="numberOfFamiliesPerShift"
                            id="numberOfFamiliesPenShift"
                            value={numberOfFamiliesPerShift}
                            min="0"
                            onChange={(e) => setNumberOfFamiliesPerShift(e.target.value)}
                            required
                        />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                        <Label for="numberOfFamiliesPerQueue">{t('Number of Families Per Queue')}</Label>
                        <Input
                            type="number"
                            name="numberOfFamiliesPerQueue"
                            id="numberOfFamiliesPenQueue"
                            min="0"
                            value={numberOfFamiliesPerQueue}
                            onChange={(e) => setNumberOfFamiliesPerQueue(e.target.value)}
                            required
                        />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                <Label>{t('Distribution Days and Shifts')}</Label>
                {distributionDays?.map((day, dayIndex) => (
                    <div key={dayIndex}>
                    <Row className="mb-3">
                        <Col md={3}>
                        <Input
                            type="date"
                            placeholder={t("Day")}
                            value={day.day}
                            onChange={(e) => handleDayChange(dayIndex, e.target.value)}
                            required
                        />
                        </Col>
                        <Col md={9}>
                        {day.shifts.map((shift, shiftIndex) => (
                            <div key={shiftIndex}>
                                <Row className="mb-2">
                                <Col md={4}>
                                    <Input
                                    type="time"
                                    placeholder={t("Start Time")}
                                    value={shift.start}
                                    onChange={(e) => handleShiftChange(dayIndex, shiftIndex, 'start', e.target.value)}
                                    required
                                    />
                                </Col>
                                <Col md={4}>
                                    <Input
                                    type="time"
                                    placeholder={t("End Time")}
                                    value={shift.end}
                                    onChange={(e) => handleShiftChange(dayIndex, shiftIndex, 'end', e.target.value)}
                                    required
                                    />
                                </Col>
                                <Col md={4}>
                                    {day.shifts.length > 1 && (
                                    <Button color="danger" onClick={() => removeShift(dayIndex, shiftIndex)}>
                                        -
                                    </Button>
                                    )}
                                </Col>
                                </Row>
                                <Row className="mb-3">
                                <Col md={12}>
                                <Label>{t("Select Volunteers for Shift")}</Label>
                                <select
                                  className='select2'
                                  data-day-index={dayIndex}
                                  data-shift-index={shiftIndex}
                                  data-select-type="shift"
                                 multiple value={shift.volunteers || []} onChange={(e) =>
                                  handleShiftVolunteerChange(dayIndex, shiftIndex, 
                                  [].slice.call(e.target.selectedOptions).map(item => item.value))} style={{ width: '100%' }}>
                                  {volunteers.map(volunteer =>
                                     <option key={volunteer.id} 
                                     value={volunteer.id}>{volunteer.individual.name}</option>)}
                                </select>
                                {/* <Input
                                    type="select"
                                    multiple
                                    value={shift.volunteers || []}
                                    onChange={(e) => handleShiftVolunteerChange(dayIndex, shiftIndex, [].slice.call(e.target.selectedOptions).map(item => item.value))}
                                >
                                    {volunteers.map((volunteer) => (
                                    <option key={volunteer.id} value={volunteer.id}>
                                        {volunteer.individual.name}
                                    </option>
                                    ))}
                                </Input> */}
                                </Col>
                            </Row>
                                <FormGroup>
                                <Label>{t("Queues")}</Label>
                                {shift.queues.map((queue, queueIndex) => (
                                    <div key={queueIndex}>
                                    <Row className="mb-2">
                                        <Col md={4}>
                                        <Label>{t("Select Volunteers for Queue")}</Label>
                                        <select 
                                          className='select2'
                                            data-day-index={dayIndex}
                                            data-shift-index={shiftIndex}
                                            data-queue-index={queueIndex}
                                            data-select-type="queue"
                                          multiple value={queue.volunteers || []} onChange={(e) => handleQueueVolunteerChange(dayIndex, shiftIndex, queueIndex, [].slice.call(e.target.selectedOptions).map(item => item.value))} style={{ width: '100%' }}>
                                            {/* {volunteers.map(volunteer => <option key={volunteer.id} value={volunteer.id}>{volunteer.individual.name}</option>)} */}
                                            {distributionDays[dayIndex].shifts[shiftIndex].volunteers?.map(volunteer_id => {
                                              return <option key={volunteer_id} value={volunteer_id}>{volunteerMap[volunteer_id]}</option>;
                                            })}
                                          </select>
                                        {/* <Input
                                            type="select"
                                            multiple
                                            value={queue.volunteers}
                                            onChange={(e) => handleQueueVolunteerChange(dayIndex, shiftIndex, queueIndex, [].slice.call(e.target.selectedOptions).map(item => item.value))}
                                        >
                                            {volunteers.map((volunteer) => (
                                            <option key={volunteer.id} value={volunteer.id}>
                                                {volunteer.individual.name}
                                            </option>
                                            ))}
                                        </Input> */}
                                        </Col>
                                        <Col md={4}>
                                        {shift.queues.length > 1 && (
                                            <Button color="danger" onClick={() => removeQueue(dayIndex, shiftIndex, queueIndex)}>
                                            -
                                            </Button>
                                        )}
                                        </Col>
                                    </Row>
                                    </div>
                                ))}
                                <Button color="primary" onClick={() => addQueue(dayIndex, shiftIndex)}>
                                {t("Add Queue")} 
                                </Button>
                                </FormGroup>
                            </div>
                        ))}
                        <Button color="primary" onClick={() => addShift(dayIndex)}>
                        {t("Add Shift")} 
                        </Button>
                        </Col>
                    </Row>
                    {distributionDays.length > 1 && (
                        <Button color="danger" onClick={() => removeDay(dayIndex)}>
                        {t("Remove Day")}
                        </Button>
                    )}
                    </div>
                ))}
                <Button color="primary" onClick={addDay}>
                {t("Add Day")}
                </Button>
                </FormGroup>
                <Button color="primary" type="submit">
                {t("Save")}
                </Button>
            </Form>
            </CardBody>
        </Card>
        </Container>
    </div>
  );
}
