import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Container, Row, Col } from "reactstrap";
import instance from "base_url";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "reactstrap";
import TableButtons from "components/Common/TableButtons";

import FiltersOffcanvas from "components/Common/FiltersOffcanvas";


export default function SupportTypes() {
  const { t } = useTranslation();
  const [isScrollBackDrop, setIsScrollBackDrop] = useState(false);
  const [supportTypes, setSupportTypes] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalRecords, setTotalRecords] = useState(0); // Track total records
  const [search, setSearch] = useState(""); // Search query
  const limit = 10; // Number of items per page

  // Get Support Types
  const toggleScrollBackDrop = () => setIsScrollBackDrop(!isScrollBackDrop);

  const applyFilters = () => {
    setCurrentPage(1);
     toggleScrollBackDrop();
  };


  // Get Support Types
  const getSupportTypes = async () => {
    try {
      const { data } = await instance.get("/support-type/");
      setSupportTypes(data.results);
    } catch (e) {
      console.error(e);
    }
  };
  // PageChange
  useEffect(() => {
    getSupportTypes();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getSupportTypes();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getSupportTypes();
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
    getSupportTypes();
  }, []);

  //MDBDataTable
  const data = {
    columns: [
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Support Name")}
          </span>
        ),
        field: "name",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Support Kind")}
          </span>
        ),
        field: "kind",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Description")}
          </span>
        ),
        field: "description",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Description")}
          </span>
        ),
        field: "description",
        sort: "asc",
        width: 200,
      },
      {
        label: (
          <span>
            <i className="fas fa-sort"></i> {t("Action")}
          </span>
        ),
        field: "action",
        sort: "disabled",
        width: 100,
      },
    ],
    rows: supportTypes
      ? supportTypes.map((item) => ({
          name: item.name,
          kind: item.kind,
          description: item.description,
          action: (
            <Link
              to={`/support-type/${item.id}`}
              state={item.id}
              className="btn btn-primary"
            >
              {t("Details")}
            </Link>
          ),
        }))
      : [],
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={8}>
                <h6 className="page-title">{t("Support Reports")}</h6>
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
            </Row>
            <TableButtons
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  t={t}
                />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
