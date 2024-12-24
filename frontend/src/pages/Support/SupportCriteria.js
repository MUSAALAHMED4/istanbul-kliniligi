import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact";  

export default function SupportCriteria() {
  const [supportCriterias, setSupportCriterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalRecords, setTotalRecords] = useState(0); // Track total records
  const [search, setSearch] = useState(""); // Search query
  const limit = 20; // Number of items per page


   const getSupportCriterias = async () => {
    setIsLoading(true);
    const offset = currentPage * limit;
    try {
      const apiUrl = search
        ? `/support-criteria/?search=${search}`
        : `/support-criteria/?limit=${limit}&offset=${offset}`;
      const { data } = await instance.get(apiUrl);
      setSupportCriterias(data.results);
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
    getSupportCriterias();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getSupportCriterias();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getSupportCriterias();
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
    getSupportCriterias();
  }, []);

  // MDBDataTable
  const data = {
    columns: [
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Title")}
          </span>
        ),
        field: "title",
        sort: "asc",
        width: 200
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Action")}
          </span>
        ),
        field: "action",
        sort: "disabled",
        width: 100
      }
    ],
    rows: supportCriterias.map(sc => ({
      title: sc.title,
      action: (
        <Link to={`/support-criteria/${sc.id}`} state={sc} className="btn btn-sm btn-primary">
          {t("Details")}
        </Link>
      )
    }))
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
                  getSupportCriterias();
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
                  <h6 className="page-title">{t("Support Criterias")}</h6>
                </Col>

                <Col md="4">
                  <div className="float-end d-none d-md-block">
                    <Link to="/support-criteria/new" className="btn btn-primary">
                      {t("Create Support Criteria")}
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
