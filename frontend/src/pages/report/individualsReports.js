import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { withTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact";
import TableButtons from "components/Common/TableButtons";

const IndividualsReports = ({ t }) => {
  const [individuals, setIndividuals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  const getIndividuals = async () => {
    setIsLoading(true);
    const offset = (currentPage - 1) * limit;
    let apiUrl = `/individuals/?limit=${limit}&offset=${offset}`;

    if (search) apiUrl += `&search=${search}`;

    try {
      const { data } = await instance.get(apiUrl);
      data.results.forEach((individual) => {
        individual.full_name = `${individual.first_name} ${individual.last_name}`;
      });

      setIndividuals(data.results);
      setTotalRecords(data.count);
      setIsLoading(false);
      setErrorOccurred(false);
    } catch (e) {
      setErrorOccurred(true);
      console.error("ERROR: ", e);
    }
  };

  useEffect(() => {
    getIndividuals();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getIndividuals();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getIndividuals();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
  };

  const totalPages = Math.ceil(totalRecords / limit);

  const data = {
    columns: [
      { label: t("Individual ID"), field: "id", sort: "asc", width: 80 },
      { label: t("Full Name"), field: "full_name", sort: "asc", width: 150 },
      {
        label: t("Phone Number"),
        field: "mobile_number",
        sort: "asc",
        width: 150,
      },
      { label: t("Job Title"), field: "job_title", sort: "asc", width: 150 },
      { label: t("salary"), field: "salary", sort: "asc", width: 150 },
      { label: t("Action"), field: "action", sort: "disabled", width: 120 },
    ],
    rows: individuals.map((individual) => {
      return {
        id: individual.id,
        full_name: individual.full_name,
        mobile_number: individual.mobile_number || "-",
        job_title: individual.job_title || "-",
        salary: Math.floor(individual.salary) || "0",
        action: (
          <Link
            to={`/individual/${individual.id}?family=${individual.family}${
              individual.visitId ? `&visit=${individual.visitId}` : ""
            }`}
            className={`btn btn-sm btn-${
              individual.is_draft ? "warning" : "primary"
            }`}
          >
            {t("Details")} {individual.is_draft ? `(${t("Draft")})` : ""}
          </Link>
        ),
      };
    }),
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {errorOccurred ? (
            <div>
              <p>{t("An Error Occurred!")}</p>
              <Button onClick={getIndividuals}>{t("Try again")}</Button>
            </div>
          ) : isLoading ? (
            <p>{t("Loading")}...</p>
          ) : (
            <div className="page-title-box">
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <h6 className="page-title">{t("Individuals Reports")}</h6>
                </Col>
              </Row>
              <div className="container-fluid">
                <Row className="mb-3">
                  <Col md={4} className="d-flex align-items-center">
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
                  </Col>
                </Row>
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
                </Row>
                <TableButtons
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  t={t}
                />
              </div>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withTranslation()(IndividualsReports);
