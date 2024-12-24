import React, { useState, useEffect } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact";

export default function Volunteers() {
  const { t , i18n } = useTranslation();
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalRecords, setTotalRecords] = useState(0); // Track total records
  const [search, setSearch] = useState(""); // Search query
  const limit = 20; // Number of items per page



// Set RTL direction
const [rtlDirection, setRtlDirection] = useState("ltr");
useEffect(() => {
  setRtlDirection(i18n.language === "ar" ? "rtl" : "ltr");
}, [i18n.language]);



  // Get Volunteers
  const getVolunteers = async () => {
    setIsLoading(true);
    const offset = currentPage * limit;
    try {
      const apiUrl = search
        ? `/volunteers/?search=${search}`
        : `/volunteers/?limit=${limit}&offset=${offset}`;
      const { data } = await instance.get(apiUrl);
    data.results.forEach((el) => {
      el.name = el.individual?.name || "-";
      el.manager = el.manager?.name || "-";
      el.position = el.position || "-";
    });
      setVolunteers(data.results);
      setTotalRecords(data.count);
      setIsLoading(false);
      setErrorOccurred(false);
    } catch (e) {
      setErrorOccurred(true);
      console.error("ERROR: ", e);
    }
  };

  // PageChange
  useEffect(() => {
    getVolunteers();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getVolunteers();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getVolunteers();
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
    getVolunteers();
  }, []);

  // Prepare data for MDBDataTable
  const data = {
    columns: [
      {
        label: t("Name"),
        field: "name",
        sort: "asc",
        width: 200,
      },
      {
        label: t("Manager"),
        field: "manager",
        sort: "asc",
        width: 200,
      },
      {
        label: t("Position"),
        field: "position",
        sort: "asc",
        width: 200,
      },
      {
        label: t("Action"),
        field: "action",
        sort: "disabled",
        width: 100,
      },
    ],
    rows: volunteers.map((volunteer) => ({
      name: volunteer.individual?.name || "-",
      manager: volunteer.manager?.name || "-",
      position: volunteer.position || "-",
      action: (
        <Link
          to={`/volunteer/${volunteer.id}`}
          className="btn btn-sm btn-primary"
        >
          {t("Details")}
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
              <Button
                onClick={() => {
                  getVolunteers();
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
                  <h6 className="page-title">{t("Volunteers")}</h6>
                </Col>

                <Col md="4">
                  <div className="float-end d-none d-md-block">
                    <Link to="/volunteer/new" className="btn btn-primary">
                      {t("Create Volunteer")}
                    </Link>
                  </div>
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
