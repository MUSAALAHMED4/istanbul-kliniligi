import React,{useState} from "react"
import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { Row, Col, BreadcrumbItem, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap"
import { useTranslation } from "react-i18next";


const Breadcrumb = props => {
  const [setting_Menu, setsetting_Menu] = useState(false)
  const { t } = useTranslation();

  return (
    <Row className="align-items-center">
      <Col sm={6}>
        <div className="page-title-box">
          <h4 className="font-size-18">{t(props.breadcrumbItem)}</h4>
          <ol className="breadcrumb mb-0">
            {
              (props.maintitle) ?
            <>
            <BreadcrumbItem>
              <Link to="/#">{t(props.maintitle)}</Link>
            </BreadcrumbItem>
            </> : ''
            }
            <BreadcrumbItem>
              <Link to="/#">{t(props.title)}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>
            {t(props.breadcrumbItem)} 
            </BreadcrumbItem>
          </ol>
        </div>
      </Col>
      <Col sm={6}>
        {/* <div className="float-end d-none d-md-block">
          <Dropdown
            isOpen={setting_Menu}
            toggle={() => {
              setsetting_Menu(!setting_Menu)
            }}
          >
            <DropdownToggle color="primary" className="btn btn-primary dropdown-toggle waves-effect waves-light">
              <i className="mdi mdi-cog me-2"></i> {t("Settings")} 
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem tag="a" href="#">{t("Action")}</DropdownItem>
              <DropdownItem tag="a" href="#">{t("Another action")}</DropdownItem>
              <DropdownItem tag="a" href="#">{t("Something else here")}</DropdownItem>
              <DropdownItem divider />
              <DropdownItem tag="a" href="#">{t("Separated link")}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div> */}
      </Col>
    </Row>
  )
}

Breadcrumb.propTypes = {
  breadcrumbItem: PropTypes.string,
  title: PropTypes.string,
  maintitle: PropTypes.string
}

export default Breadcrumb
