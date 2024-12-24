
import React, {useState, useEffect} from "react";
import { Container, Row, Col } from "reactstrap";
import EventDetails from '../../components/Event/EventDetails'
import { useParams } from "react-router-dom";
import instance from "base_url";

export default function CreateOrEditVolunteer() {
    const [event, setEvent] = useState(null);
    const [volunteers, setVolunteers] = useState();
    const [families, setFamilies] = useState();
    const { id } = useParams();

    const getEventDetails = async () => {
        try {
          const { data } = await instance.get(`/event/${id}/`);
          console.log("event", data);
          setEvent(data);
        } catch (e) {
          console.error("Error fetching event:", e);
        }
      }

    const getVolunteers = async () => {
        try {
          const { data } = await instance.get(`/volunteers/`);
          // set volunteers object with key as volunteer id
          console.log(data.results)
          const volunteers_ = data.results.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {});
          setVolunteers(volunteers_);
        } catch (e) {
          console.error("Error fetching volunteers:", e);
        }
      }

    const getFamilies = async () => {
        try {
          const { data } = await instance.get(`/families/`);
          console.log("families", data);
          // set families object with key as family id
          const families_ = data.results.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {});
          setFamilies(families_);
        } catch (e) {
          console.error("Error fetching families:", e);
        }
      }

    useEffect(() => {
        getEventDetails();
        getVolunteers();
        getFamilies();
    }, []);


    console.log("eveddddnt", event);

    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <div className="page-title-box">
              <Row className="align-items-center mb-3">
                <Col md={8}>
                <h6 className="page-title">
                    Event
                  </h6>
                </Col>
              </Row>
                <div className="form-page-container">
                    {event && <EventDetails event={event} _volunteers={volunteers} _families={families} />}
                </div>
            </div>
          </Container>
        </div>
      </React.Fragment>
    );
  }
  