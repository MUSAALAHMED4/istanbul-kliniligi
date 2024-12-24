import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Table from './Table'; 
import PopupWindow from './PopupWindow';
import './EventDetails.css'; 
import { useTranslation } from "react-i18next"; 


const EventDetails = ({ event, _volunteers,   _families }) => {
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showFamilies, setShowFamilies] = useState(false);
  const [families, setFamilies] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedShift, setSelectedShift] = useState('');


  const { t } = useTranslation();
    const toggleVolunteers = (tableId) => {
    var tableVolunteers = [];
    if (selectedDay && selectedShift) {
      tableVolunteers = selectedDay.shifts[selectedShift].queues[tableId]?.volunteers?.map(volunteerId =>
         _volunteers[volunteerId].individual.name);
    }
   
    // const tableVolunteers = [];
    setVolunteers(tableVolunteers);
    setShowVolunteers(!showVolunteers);
  }
  const toggleFamilies = (tableId) => {
    var tableFamilies = [];
    if (selectedDay && selectedShift) {
      const queuePages = selectedDay.shifts[selectedShift].queues[tableId]?.queue_pages;
      // tableFamilies is combine of all families in all pages
      tableFamilies = queuePages?.reduce((acc, curr) => {
        const families = curr.families;
        return acc.concat(families);
      }
      , []);
    }
    console.log(tableFamilies);
    setFamilies(tableFamilies);
    setShowFamilies(!showFamilies);
  }


  useEffect(() => {

    // const savedDay = localStorage.getItem('selectedDay') || event.eventDays[0]; 
    // const savedShift = localStorage.getItem('selectedShift') || '1';

    // setSelectedDay(savedDay);
    // setSelectedShift(savedShift);
  }, [event.eventDays]);

  const handleDayChange = (e) => {
    const day = event.distribution_days.find(day => day.day === e.target.value);
    setSelectedDay(day);
  };

  const handleShiftChange = (e) => {
    const shift = e.target.value;
    setSelectedShift(shift);
  };

  return (
    <div className="event-details-container">
      <Container>
        <Row className="mb-4">
          <Col>
            <div className="field-box">
              <label>{t("Name")}</label>
              <p>{event.name}</p>
            </div>
          </Col>
          <Col>
            <div className="field-box">
              <label>{t("Support Type")}</label>
              <p>{event.support_type.name}</p>
            </div>
          </Col>
          <Col>
            <div className="field-box">
              <label>{t("Budget")}</label>
              <p>{event.budget || "N/A"}</p>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <div className="field-box large-box">
              <label>{t("Number of Families")}</label>
              <p>{event.number_of_families || "N/A"}</p>
            </div>
          </Col>
          <Col>
            <div className="field-box large-box">
              <label>{t("Event Days")}</label>
              <div className="dropdown1-container">
                <select onChange={handleDayChange} className="dropdown1">
                  <option value="">{t("Select a Day")}</option>
                  {event?.distribution_days?.map((distributionDay, index) => (
                    <option key={index} value={distributionDay.day}>{distributionDay.day}</option>
                  ))}
                </select>
              </div>
            </div>
          </Col>
          <Col>
            <div className="field-box large-box">
              <label>{t("Number of Shifts")}</label>
              <div className="dropdown1-container">
                <select value={selectedShift} onChange={handleShiftChange} className="dropdown1">
                  <option value="">{t("Select a Shift")}</option>
                  {selectedDay?.shifts?.map((shift, index) => (
                    <option key={index} value={index}>{`${shift.start} - ${shift.end}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </Col>
        </Row>

        <div className="table-section">
          {selectedDay && selectedShift ? (
            <>
              {selectedDay?.shifts[selectedShift].queues?.map((shift, index) => (
                <Table key={index} tableNumber={index+1} 
                selectedDay={selectedDay} selectedShift={selectedShift}
                 toggleFamilies={() => toggleFamilies(index)}
                  toggleVolunteers={() => toggleVolunteers(index)} />
              ))}
              {/* <Table tableNumber="2" selectedDay={selectedDay} selectedShift={selectedShift} toggleFamilies={toggleFamilies} toggleVolunteers={toggleVolunteers} />
              <Table tableNumber="3" selectedDay={selectedDay} selectedShift={selectedShift} toggleFamilies={toggleFamilies} toggleVolunteers={toggleVolunteers} />
              <Table tableNumber="4" selectedDay={selectedDay} selectedShift={selectedShift} toggleFamilies={toggleFamilies} toggleVolunteers={toggleVolunteers} /> */}
            </>
          ) : (
            <p>{t("Please select a day and a shift to view the tables.")}</p>
          )}
        </div>

        {showVolunteers && (
          <PopupWindow
            title={t("Volunteers")}
            list={volunteers}
            onClose={toggleVolunteers}
          />
        )}

        {showFamilies && (
          <PopupWindow
            title={t("Families")}
            list={families}
            onClose={toggleFamilies}
          />
        )}
      </Container>
    </div>
  );
};

export default EventDetails;


