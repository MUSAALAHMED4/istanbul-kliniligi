import instance from "base_url";
import React from "react";
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Input,
  Label,
  FormGroup,
  Button,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Autocomplete from "components/Common/Autocomplete";

const FiltersOffcanvas = ({
  isOpen,
  toggle,
  familyStatus,
  setFamilyStatus,
  identityPlace,
  setIdentityPlace,
  healthCondition,
  setHealthCondition,
  setProvince,
  province,
  district,
  setDistrict,
  area,
  setArea,
  applyFilters,
  t,
  sehirData,
  mahalleData,
  ilceData,
  setSehirData,
  setMahalleData,
  setIlceData,
  getIlceData,
  getMahalleData
}) => {
  const { i18n } = useTranslation();
  const [rtlDirection, setRtlDirection] = useState("ltr"); 
  // Set RTL direction
  useEffect(() => {
    setRtlDirection(i18n.language === "ar" ? "rtl" : "ltr");
  }, [i18n.language]);

  console.log(getIlceData)
 

  // // Fetch data for health conditions and disabilities
  // const fetchConditions = async () => {
  //   try {
  //     const { data: healthData } = await instance.get("/health-conditions/");
  //     setHealthConditions(healthData);
  //     const { data: disabilityData } = await instance.get(
  //       "/disability-conditions/"
  //     );
  //     setDisabilityConditions(disabilityData);
  //   } catch (error) {
  //     console.error("Error fetching conditions:", error);
  //   }
  // };

  // UseEffect to fetch conditions on load
  // useEffect(() => {
  //   if (isOpen) {
  //     fetchConditions();
  //   }
  // }, [isOpen]);
  return (
    <Offcanvas isOpen={isOpen} toggle={toggle}
    style={{
      direction: i18n.language === "ar" ? "rtl" : "ltr",
      textAlign: i18n.language === "ar" ? "right" : "left",
    }}
    >
      <OffcanvasHeader toggle={toggle}>{t("Table filters")}</OffcanvasHeader>
      <OffcanvasBody>
        <FormGroup>
          <Label for="familyStatus">{t("Family Status")}</Label>
          <Input
            type="select"
            id="familyStatus"
            value={familyStatus}
            onChange={(e) => setFamilyStatus(e.target.value)}
          >
            <option value="">{t("Select Family Status")}</option>
            <option value="completed">{t("Completed")}</option>
            <option value="incomplete">{t("Incomplete")}</option>
          </Input>
        </FormGroup>

        <FormGroup>
          <Label for="identityPlace">{t("Identity Place")}</Label>
          <Autocomplete
            name={t("Identity Place")}
            searchParam="name"
            placeholder={identityPlace || t("Select Identity Place")} 
            basePlaceholder={t("Select Identity Place") }
            list={sehirData}
            selectedObject={(value) => {
              setIdentityPlace(value?.name || "");
            }}
            isError={false}
            searchApi={false}
          />
        </FormGroup>
        <FormGroup>
          <Label for="conditionFilter">
            {t("Health/Disability Condition")}
          </Label>
          <Input
            type="select"
            id="conditionFilter"
            value={healthCondition}
            onChange={(e) => setHealthCondition(e.target.value)}
          >
            <option value="">{t("Select Condition")}</option>
            <option value="illness">{t("Health")}</option>
            <option value="disability">{t("Disability")}</option>
          </Input>
        </FormGroup>

        <FormGroup>
          <Label for="province">{t("Province")}</Label>
          <Autocomplete
            name={t("Province")}
            searchParam="name"
            placeholder={province || t("Select Province")}
            basePlaceholder={t("Select Province")}
            list={sehirData}
            selectedObject={(value) => {
              setProvince(value?.name || "");
              getIlceData(value);
            }}
            isError={false}
            searchApi={false}
          />
          {/* <Input
            type="text"
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder={t("Enter Province")}
          /> */}
        </FormGroup>

        <FormGroup>
          <Label for="district">{t("District")}</Label>
          {/* <Input
            type="text"
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={t("Enter District")}
          /> */}
          <Autocomplete
            name={t("District")}
            searchParam="name"
            placeholder={district || t("Select District")}
            basePlaceholder={t("Select District")}
            list={ilceData}
            selectedObject={(value) => {
              setDistrict(value?.name || "");
              getMahalleData(value);
            }}
            isError={false}
            searchApi={false}
          />
        </FormGroup>

        <FormGroup>
          <Label for="area">{t("Area")}</Label>
          {/* <Input
            type="text"
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t("Enter Area")}
          /> */}
          <Autocomplete
            name={t("Area")}
            searchParam="name"
            placeholder={area || t("Select Area")}
            basePlaceholder={t("Select Area")}
            list={mahalleData}
            selectedObject={(value) => {
              setArea(value?.name || "");
            }}
            isError={false}
            searchApi={false}
          />
        </FormGroup>

        <Button color="primary" onClick={applyFilters} className="mt-3">
          {t("Apply Filters")}
        </Button>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default FiltersOffcanvas;
