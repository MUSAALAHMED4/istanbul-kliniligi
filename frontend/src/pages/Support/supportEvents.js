import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact"; 

export default function SupportEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const isEmployee = localStorage.getItem("userType") === "employee";
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalRecords, setTotalRecords] = useState(0); // Track total records
  const [search, setSearch] = useState(""); // Search query
  const limit = 20; // Number of items per page


  const getEvents = () => {
    setIsLoading(true);
    const offset = (currentPage - 1) * limit;  
  
     const apiUrl = search
      ? `/event/?search=${search}&limit=${limit}&offset=${offset}`
      : `/event/?limit=${limit}&offset=${offset}`;
  
    instance
      .get(apiUrl)
      .then((res) => {
        setEvents(res.data.results);
        setTotalRecords(res.data.count);  
        setIsLoading(false);
        setErrorOccurred(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorOccurred(true);
        console.error("Error fetching events: ", err);
      });
  };



   // PageChange
   useEffect(() => {
    getEvents();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getEvents();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getEvents();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / limit);




  useEffect(() => {
    getEvents();
  }, []);

  //MDBDataTable
  const data = {
    columns: [
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Name")}
          </span>
        ),
        field: "name",
        sort: "asc",
        width: 200
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Support Type")}
          </span>
        ),
        field: "support_type",
        sort: "asc",
        width: 200
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Budget")}
          </span>
        ),
        field: "budget",
        sort: "asc",
        width: 100
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Number of Families")}
          </span>
        ),
        field: "number_of_families",
        sort: "asc",
        width: 150
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Event Days")}
          </span>
        ),
        field: "event_days",
        sort: "asc",
        width: 150
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Action")}
          </span>
        ),
        field: "action",
        sort: "disabled",
        width: 150
      }
    ],
    rows: events.map(event => ({
      name: event.name,
      support_type: event.support_type.name,
      budget: event.budget,
      number_of_families: event.number_of_families,
      event_days: event.event_days,
      action: (
        <>
          <Link to={`/event/${event.id}`} state={event} className="btn btn-sm btn-primary">
            {t('Show')}
          </Link>
          {isEmployee && (
          <Link style={{ marginLeft: "20px" }} to={`/event/${event.id}/edit`} state={event} className="btn btn-sm btn-primary">
            {t('Edit')}
          </Link>
          )}
        </>
      )
    }))
  };

  console.log("events", events);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {errorOccurred ? (
            <div>
              <p>{t("An Error Occurred!")}</p>
              <Button
                onClick={() => {
                  getEvents();
                }}
              >
                {t("Try again")}
              </Button>
            </div>
          ) : isLoading ? (
            <p>{t("Loading...")}</p>
          ) : (
            <div className="page-title-box">
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <h6 className="page-title">{t("Events")}</h6>
                </Col>

                {isEmployee && (
                <Col md="4">
                  <div className="float-end d-none d-md-block">
                    <Link to="/events/new" className="btn btn-primary">
                      {t("Create Support Event")}
                    </Link>
                  </div>
                </Col>
                )}
              </Row>
              <div className="container-fluid">
                <div className="row mb-3">
                  <div className="col-4 d-flex align-items-center">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t("Search")}
                        value={search}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        autoFocus
                      />
                      <Button
                        color="primary"
                        onClick={handleSearch}
                        className="btn-sm"
                      >
                        {t("Search")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Row>
                <Col>
                  <MDBDataTable
                    searching={false}
                    searchLabel={search || t("Search")}
                    infoLabel={[t("Showing"), t("to"), t("of"), t("entries")]}
                    noRecordsFoundLabel={t("No records found")}
                    // paginationLabel={[t("Previous"), t("Next"), t("End")]}
                    noBottomColumns={true}
                    responsive
                    striped
                    bordered
                    data={data}
                    displayEntries={false}
                    paging={false}
                    // currentPage={currentPage - 1}
                    onSearch={(value) => setSearch(value)}
                  />
                </Col>
              </Row>
              <button
                className={`btn btn-md ${
                  currentPage === 1 ? "" : "btn-primary"
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t("Previous")}
              </button>
              <span style={{ marginLeft: 10 }}>
                {currentPage} of {totalPages}
              </span>
              <button
                style={{ marginLeft: 10 }}
                className={`btn btn-md ${
                  currentPage === totalPages ? "" : "btn-primary"
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t("Next")}
              </button>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
