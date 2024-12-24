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
import { support } from "jquery";
import SupportTypes from "pages/Support/supportTypes";

// Families
function Families({ t }) {
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isScrollBackDrop, setIsScrollBackDrop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalRecords, setTotalRecords] = useState(0); // Track total records
  const [search, setSearch] = useState(""); // Search query
  const limit = 10; // Number of items per page

  // State for filters
  const [disabilityCondition, setDisabilityCondition] = useState("");
  const [familyStatus, setFamilyStatus] = useState("");
  const [identityPlace, setIdentityPlace] = useState("");
  const [healthCondition, setHealthCondition] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const toggleScrollBackDrop = () => setIsScrollBackDrop(!isScrollBackDrop);

  const [sehirData, setSehirData] = useState([]);
  const [ilceData, setIlceData] = useState([]);
  const [mahalleData, setMahalleData] = useState([]);

  const applyFilters = () => {
    // add filters to the url query
    // window.location.search = `?familyStatus=${familyStatus}&identityPlace=${identityPlace}&healthCondition=${healthCondition}&disabilityCondition=${disabilityCondition}&province=${province}&district=${district}&area=${area}`;

    setCurrentPage(1); // Reset to first page
    getFamilies(); // Fetch data with filters
    toggleScrollBackDrop(); // Close the filter menu
  };

  // Get Families
  const getFamilies = async () => {
    setIsLoading(true);
    const offset = (currentPage - 1) * limit;
    const searchParams = window.location.search;

    try {
      var apiUrl = `/families/?limit=${limit}&offset=${offset}`;

      if (search) apiUrl += `&search=${search}`;
      if (familyStatus) {
        // Translate status to hasDraft filter
        const hasDraftFilter = familyStatus === "incomplete" ? "true" : "false";
        apiUrl += `&is_draft=${hasDraftFilter}`;
      }
      if (identityPlace) apiUrl += `&identity_place=${identityPlace}`;
      if (healthCondition) apiUrl += `&health_condition=${healthCondition}`;
      if (province) apiUrl += `&province=${province}`;
      if (district) apiUrl += `&district=${district}`;
      if (area) apiUrl += `&area=${area}`;

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
        // family.phone_no = headIndividual ? headIndividual.mobile_number : "-";
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

  const getSehirData = async () => {
    try {
      const { data } = await instance.get("/cities/");
      setSehirData(data.results);
    } catch (e) {
      console.error(e);
    }
  };

  const getIlceData = async (city) => {
    console.log(city);
    try {
      const { data } = await instance.get(`/cities/${city.id}/districts/`);
      setIlceData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const getMahalleData = async (district) => {
    try {
      const { data } = await instance.get(
        `/districts/${district.id}/neighborhoods/`
      );
      setMahalleData(data);
    } catch (e) {
      console.error(e);
    }
  };

  // PageChange
  useEffect(() => {
    getFamilies();
    getSehirData();
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
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / limit);

  // Prepare data for MDBDataTable
  const data = {
    columns: [
      {
        label: <span>{t("Family ID")}</span>,
        field: "family_id",
        sort: "asc",
        width: 80,
      },
      {
        label: (
          <span>
           {t("Title")}
          </span>
        ),
        field: "title",
        sort: "disabled",
        width: 120,
      },
      {
        label: (
          <span>
          {t("Husband's")}
          </span>
        ),
        field: "head_name",
        sort: "disabled",
        width: 120,
      },
      {
        label: (
          <span>
       {t("Wife's")}
          </span>
        ),
        field: "partner_name",
        sort: "disabled",
        width: 120,
      },
      {
        label: (
          <span>
           {t("Phone No.")}
          </span>
        ),
        field: "phone_no",
        sort: "disabled",
        width: 150,
      },
      {
        label: (
          <span>
          {t("Address")}
          </span>
        ),
        field: "address",
        sort: "disabled",
        width: 100,
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
      return {
        family_id: family.id,
        phone_no: <>{family.phone_no}</>,
        title: family.title,
        head_name: family.head_name,
        partner_name: family.partner_name,
        address: family.address,
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
                  <h6 className="page-title">{t("Families")}</h6>
                </Col>

                <Col md="4">
                  <div className="float-end d-none d-md-block">
                    <Link to="/individual/new" className="btn btn-primary">
                      {t("Create Family")}
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
                      <Button
                        color="secondary"
                        onClick={toggleScrollBackDrop}
                        className="btn-sm ms-2"
                      >
                        {t("Table filters")}
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
              <TableButtons
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                t={t}
              />
            </div>
          )}
          {/* Use FiltersOffcanvas Component */}
          <FiltersOffcanvas
            isOpen={isScrollBackDrop}
            toggle={toggleScrollBackDrop}
            familyStatus={familyStatus}
            setFamilyStatus={setFamilyStatus}
            identityPlace={identityPlace}
            setIdentityPlace={setIdentityPlace}
            healthCondition={healthCondition}
            setHealthCondition={setHealthCondition}
            disabilityCondition={disabilityCondition}
            setDisabilityCondition={setDisabilityCondition}
            setProvince={setProvince}
            province={province}
            district={district}
            setDistrict={setDistrict}
            area={area}
            setArea={setArea}
            applyFilters={applyFilters}
            t={t}
            sehirData={sehirData}
            mahalleData={mahalleData}
            ilceData={ilceData}
            getIlceData={getIlceData}
            setSehirData={setSehirData}
            setMahalleData={setMahalleData}
            getMahalleData={getMahalleData}
            setIlceData={setIlceData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default withTranslation()(Families);
