import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import instance from "base_url"
import { 
  Container,
  Row, 
  Col, 
  Button, 
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody, } from "reactstrap"
import * as XLSX from 'xlsx';
import moment from "moment";
import { withTranslation } from "react-i18next";



 function Individuals({ t }) {
  const [indivduals, setIndividuals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorOccurred, setErrorOccurred] = useState(false)
  const [faildIndividuals, setFaildIndividuals] = useState(null)
  const buttonRef = useRef(null);

  // Get Indivduals
  const getIndivduals = async () => {
    setIsLoading(true)
    try {
      const { data } = await instance.get("/individuals/")
      setIndividuals(data.results)
      setIsLoading(false)
    } catch (e) {
      setErrorOccurred(true)
      console.error("ERROR: ", e)
    }
  }

  const createIndividual = async (payload) =>{
    try{
      const res = await instance.post("/individuals/", payload)
      getIndivduals()
    } catch (error){
      console.error(error)
    }
  }

  const handleIndividualImport =  (importedData)=>{
    debugger
    const headers = importedData[0]
    const faIvdividualList = []

    // Get individual array
    for(let i = 1; i <= importedData.length - 1; i++){
      const individualObject = {} 
      //  check the empty rows
      if(importedData[i]?.length == 24){
        // Check the headers of the objects
        if(!importedData[i].includes(undefined)){
          // Create individual object
          for (let j = 0; j < headers.length; j++) {
            if(headers[j] === "date_of_birth"){
              importedData[i][j] = moment(importedData[i][j]).format("YYYY-MM-DD")
            }
            individualObject[headers[j]] = importedData[i][j] === "-" ? undefined : importedData[i][j];
          }
          createIndividual(individualObject)
        } else {
          faIvdividualList.push(i)
        }
      }
    }
    setFaildIndividuals(faIvdividualList)
  }

  // Upload Bulk Individuals
  const importIndividuals = ()=>{
    buttonRef.current.click()
  }

  // handle Upload Individuals File
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            handleIndividualImport(sheetData);
        };
        reader.readAsBinaryString(file);
    }
};

  useEffect(() => {
    getIndivduals()
  }, [])

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
        {errorOccurred ? 
          <div>
            <p>{t('An Error Occurred!')}</p>
            <Button onClick={()=>{getIndivduals()}}>{t('Try again')}</Button>
          </div>
          :
          isLoading ?
          <p>{t('Loading...')}</p>
          :
          <div className="page-title-box">
            <Row className="align-items-center mb-3">
              <Col md={8}>
                <h6 className="page-title">{t('Individuals')}</h6>
              </Col>

              <Col md="4" className="d-flex justify-content-end">
                <div className="">
                  <Link to="/individual-details" className="btn btn-primary">
                  {t('Create Individual')}
                  </Link>
                </div>
                <div className="ms-2">
                  <Button color="primary" to="/individual-details" onClick={()=>{importIndividuals()}}>
                  {t('Import Individuals')}
                  </Button>
                  <Offcanvas
                        isOpen={faildIndividuals}
                        direction="end"
                        toggle={()=>{setFaildIndividuals(null)}}>
                        <OffcanvasHeader toggle={()=>{setFaildIndividuals(null)}}>
                        {t('Failed To Some Individuals!')}
                        </OffcanvasHeader>
                        <OffcanvasBody>
                            {
                              faildIndividuals ?
                              faildIndividuals.map((item, index)=>(
                                <p className="text-danger" key={index}>- {t('Failed to import Individual in line')}: {item} </p>
                              )) :
                              <></>
                            }
                        </OffcanvasBody>
                    </Offcanvas>
                  <input type="file" accept=".xlsx" onChange={handleFileChange} className="d-none" ref={buttonRef} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="bg-dark">
                      <tr>
                        <th scope="col">{t('National Id')}</th>
                        <th scope="col">{t('Name')}</th>
                        <th scope="col">{t('Date of birth')}</th>
                        <th scope="col">{t('Place of birth')}</th>
                        <th scope="col">{t('Mobile')}</th>
                        <th scope="col" className="text-center">{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indivduals.map((individual, index) => (
                        <tr key={index}>
                          <td>{individual.national_id}</td>
                          <td>{individual.first_name} {individual.last_name}</td>
                          <td>{individual.date_of_birth}</td>
                          <td>{individual.place_of_birth}</td>
                          <td>{individual.mobile_number}</td>
                          <td className="text-center">
                            <Link
                              to="/individual-details"
                              state={individual}
                              className="btn btn-sm btn-primary"
                            >
                              {t('Details')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </div>
          }
        </Container>
      </div>
    </React.Fragment>
  )
}
export default withTranslation()(Individuals);