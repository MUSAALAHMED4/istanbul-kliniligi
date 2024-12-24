import React from 'react'
import {
    Container,
    Row,
    Col,
    Button,
  } from "reactstrap"
  

  import { withTranslation } from "react-i18next"; 


 function IndividualDetails({ t } ) {
  return (
    <React.Fragment>
    <div className="page-content">
      <Container fluid>
        <div>{t('individualDetails')}</div>
      </Container>
    </div>
  </React.Fragment>
  )
}

export default withTranslation()(IndividualDetails);