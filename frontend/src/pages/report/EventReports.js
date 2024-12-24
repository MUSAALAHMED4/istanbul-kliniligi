import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact";
import TableButtons from "components/Common/TableButtons";



export default function EventReports() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

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

  const data = {
    columns: [
      {
        label: <span>{t("Name")}</span>,
        field: "name",
        sort: "asc",
        width: 200,
      },
      {
        label: <span>{t("Support Type")}</span>,
        field: "support_type",
        sort: "asc",
        width: 200,
      },
      {
        label: <span>{t("Budget")}</span>,
        field: "budget",
        sort: "asc",
        width: 100,
      },
      {
        label: <span>{t("Number of Families")}</span>,
        field: "number_of_families",
        sort: "asc",
        width: 150,
      },
      {
        label: <span>{t("Event Days")}</span>,
        field: "event_days",
        sort: "asc",
        width: 150,
      },
      {
        label: <span>{t("Action")}</span>,
        field: "action",
        sort: "disabled",
        width: 150,
      },
    ],
    rows: events.map((event) => ({
      name: event.name,
      support_type: event.support_type?.name || "-",
      budget: `${parseInt(event.budget)}`,
      number_of_families: event.number_of_families || "-",
      event_days: event.event_days || "-",
      action: (
        <Link
          to={`/event/${event.id}`}
          className="btn btn-sm btn-primary"
        >
          {t("View Details")}
        </Link>
      ),
    })),
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {errorOccurred ? (
            <div>
              <p>{t("An Error Occurred!")}</p>
              <Button onClick={getEvents}>{t("Try again")}</Button>
            </div>
          ) : isLoading ? (
            <p>{t("Loading...")}</p>
          ) : (
            <div className="page-title-box">
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <h6 className="page-title">{t("Event Reports")}</h6>
                </Col>
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
                     noBottomColumns={true}
                    responsive
                    striped
                    bordered
                    data={data}
                    displayEntries={false}
                    paging={false}
                     onSearch={(value) => setSearch(value)}
                  />
                </Col>
                <TableButtons
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  t={t}
                />
              </Row>
              
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
