import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Button, Col, Container, Row } from "reactstrap";
import moment from "moment/moment";
import { withTranslation, useTranslation } from "react-i18next";
import { MDBDataTable } from 'mdbreact';

function Visits({ t }) {
    const { i18n } = useTranslation();
    const isEmployee = localStorage.getItem("userType") === "employee";
    const [visits, setVisits] = useState([]);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorOccurred, setErrorOccurred] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const [totalRecords, setTotalRecords] = useState(0); // Track total records
    const [search, setSearch] = useState(""); // Search query
    const limit = 20; // Number of items per page
 
 
    const getVisits = async () => {
        setIsLoading(true);
        const offset = (currentPage - 1) * limit;  
        try {
            const apiUrl = search
                ? `/visits/?search=${search}`
                : `/visits/?limit=${limit}&offset=${offset}`;
            const { data } = await instance.get(apiUrl);
            setVisits(data.results);
            setFilteredVisits(data.results);
            setTotalRecords(data.count); 
            setIsLoading(false);
            setErrorOccurred(false);
        } catch (e) {
            setErrorOccurred(true);
            console.error("ERROR: ", e);
        }
    }

    useEffect(() => {
        moment.locale(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        getVisits(); 
    }, []);


    const updateVisitStatus = async (visit, status) => {
        const newVisit = { ...visit };
        newVisit.visit_status = status;
        newVisit.family_id = newVisit.family.id;
        try {
            const res = await instance.put(`/visits/${visit.id}/`, newVisit);
            getVisits(); 
        } catch (e) {
            console.error(e);
        }
    }

    const actions = (visit) => {
        if (isEmployee) {
            if (visit.visit_status === "requested") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("View details")}
                </Link>;
            } else if (visit.visit_status === "pending") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("View details")}
                </Link>;
            } else if (visit.visit_status === "draft") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("View details")}
                </Link>;
            } else if (visit.visit_status === "completed") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("Review")}
                </Link>;
            } else if (visit.visit_status === "cancelled") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("Change volunteer")}
                </Link>;
            }
        } else {
            if (visit.visit_status === "requested") {
                return <>
                    <Button onClick={() => {
                        updateVisitStatus(visit, "pending")
                    }} color="primary" size="sm">
                        {t("Accept visit")}
                    </Button>
                    <Button onClick={() => {
                        updateVisitStatus(visit, "cancelled")
                    }} color="secondary" size="sm" className="mx-2">{t("Reject")}</Button>
                </>;
            } else if (visit.visit_status === "pending") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("Make visit")}
                </Link>;
            } else if (visit.visit_status === "draft") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("Complete visit")}
                </Link>;
            } else if (visit.visit_status === "completed") {
                return <Link to={`/visit/${visit.id}`} state={visit} className="btn btn-primary btn-sm">
                    {t("Show")}
                </Link>;
            } else if (visit.visit_status === "cancelled") {
                return <></>;
            }
        }
    }

    const renderStatusIcon = (status) => {
        switch (status) {
            case "requested":
                return <i className="fa fa-share-square text-info"></i>;
            case "pending":
                return <i className="fas fa-clock text-warning"></i>;
            case "completed":
                return <i className="fas fa-check-circle text-success"></i>;
            case "draft":
                return <i className="fas fa-hourglass-start"></i>;
            case "cancelled":
                return <i className="fas fa-times-circle text-danger"></i>;
            default:
                return <></>;
        }
    }


    
  // PageChange
  useEffect(() => {
    getVisits();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getVisits();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getVisits();
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


    console.log("visits", visits);
    // Define columns in the data for MDBDataTable
    const data = {
        columns: [
            { label: t("Volunteer"), field: 'volunteer_name' },
            { label: t("Individual"), field: 'individual_name' },
            { label: t("Family"), field: 'family_title' },
            { label: t("Date"), field: 'visit_date' },
            { label: t("Status"), field: 'visit_status' },
            { label: t("Action"), field: 'action' },
        ],
        rows: filteredVisits.map(visit => ({
            volunteer_name: visit.volunteer_name,
            individual_name: visit.individual?.name,
            family_title: visit.family?.title,
            visit_date: moment(visit.visit_date).format('MMMM D, YYYY, h:mm a'),
            visit_status: <>{renderStatusIcon(visit.visit_status)} {t(visit.visit_status)}</>,
            action: actions(visit)
        }))
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {errorOccurred ? (
                        <div>
                            <p>{t("An Error Occurred!")}</p>
                            <Button onClick={() => getVisits()}>{t("Try again")}</Button>
                        </div>
                    ) : isLoading ? (
                        <p>{t("Loading...")}.</p>
                    ) : (
                        <div className="page-title-box">
                            <Row className="mb-3">
                                <Col md={8}>
                                    <h6 className="page-title">{t("Visits")}</h6>
                                </Col>
                                <Col md="4">
                                    <div className="float-end d-none d-md-block">
                                        {isEmployee && (
                                            <Link to="/visit/new" className="btn btn-primary">
                                                {t("Create Visit")}
                                            </Link>
                                        )}
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

export default withTranslation()(Visits);
