import React, { useEffect, useState } from "react";
import instance from "base_url";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import { withTranslation } from "react-i18next";
import { MDBDataTable } from "mdbreact";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import FiltersOffcanvas from "components/Common/FiltersOffcanvas";
import { getSehirData, getIlceData, getMahalleData } from "helpers/address";
import TableButtons from "components/Common/TableButtons";

const FamilyReports = ({ t }) => {
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isScrollBackDrop, setIsScrollBackDrop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  const toggleScrollBackDrop = () => setIsScrollBackDrop(!isScrollBackDrop);

  const applyFilters = () => {
    setCurrentPage(1);
    getFamilies();
    toggleScrollBackDrop();
  };

  const getFamilies = async () => {
    setIsLoading(true);
    const offset = (currentPage - 1) * limit;
    let apiUrl = `/families/?limit=${limit}&offset=${offset}`;

    if (search) apiUrl += `&search=${search}`;

    try {
      const { data } = await instance.get(apiUrl);
      data.results.forEach((family) => {
        const headIndividual = family.individuals.find(
          (item) => item.is_head_of_family
        );

        const partner = family.individuals.find(
          (item) =>
            item.is_partner_name === headIndividual?.id && item.is_partner_name
        );
        family.partner_name =
          headIndividual && headIndividual.partner_name
            ? headIndividual.partner_name
            : "-";

        family.address = family.individuals.length
          ? family.individuals[0].address
          : null;
        family.head_name = headIndividual
          ? `${headIndividual.first_name} ${headIndividual.last_name}`
          : "-";
        if (headIndividual) {
          family.phone_no = headIndividual.mobile_number || "-";
        } else {
          family.phone_no =
            family.individuals.filter(
              (individual) => individual.mobile_number
            )?.[0]?.mobile_number || "-";
        }
      });

      setFamilies(data.results);
      setTotalRecords(data.count);
      setIsLoading(false);
      setErrorOccurred(false);
    } catch (e) {
      setErrorOccurred(true);
      console.error("ERROR: ", e);
    }
  };

  useEffect(() => {
    getFamilies();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getFamilies();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getFamilies();
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
      {
        label: <span>{t("Family ID")}</span>,
        field: "family_id",
        sort: "asc",
        width: 80,
      },
      {
        label: <span>{t("Title")}</span>,
        field: "title",
        sort: "disabled",
        width: 120,
      },
      {
        label: <span>{t("Head of family")}</span>,
        field: "head_name",
        sort: "disabled",
        width: 120,
      },
      {
        label: <span>{t("Members")}</span>,
        field: "members",
        sort: "disabled",
        width: 120,
      },
      {
        label: <span>{t("Phone No.")}</span>,
        field: "phone_no",
        sort: "disabled",
        width: 120,
      },
      {
        label: (
          <div>
            <span>{t("Family Total")}</span>
            <br />
            <small>({t("Income/Expenses")})</small>
          </div>
        ),
        field: "familyTotal",
        sort: "disabled",
        width: 120,
      },
      {
        label: <span>{t("Action")}</span>,
        field: "action",
        sort: "disabled",
        width: 120,
      },
    ],
    rows: families.map((family) => {
      const hasDraft = family.individuals.some(
        (individual) => individual.is_draft
      );
      const income = family.expenses_summary?.total_income || 0;
      const expenses = family.expenses_summary?.total_expenses || 0;
  
      return {
        family_id: family.id,
        phone_no: <>{family.phone_no}</>,
        title: family.title,
        head_name: family.head_name,
        members: family.individuals.length || 0,
        familyTotal: (
          <div>
            <span
              style={{ color: expenses > income ? "red" : "inherit" }}
            >
              {income} / {expenses}
            </span>
          </div>
        ),
        action: (
          <Link
            to={`/family/${family.id}`}
            className={`btn btn-sm btn-${hasDraft ? "warning" : "primary"}`}
          >
            {t("Details")} {hasDraft ? `(${t("Draft")})` : ""}
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
              <Button
                onClick={() => {
                  getFamilies();
                }}
              >
                {t("Try again")}
              </Button>
            </div>
          ) : isLoading ? (
            <p>{t("Loading")}...</p>
          ) : (
            <div className="page-title-box">
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <h6 className="page-title">{t("Family Reports")}</h6>
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
          <FiltersOffcanvas
            isOpen={isScrollBackDrop}
            toggle={toggleScrollBackDrop}
            applyFilters={applyFilters}
            t={t}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withTranslation()(FamilyReports);
