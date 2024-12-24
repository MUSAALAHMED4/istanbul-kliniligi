import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";
import SimpleBar from "simplebar-react";


//i18n
import { withTranslation } from "react-i18next";

const NotificationDropdown = props => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          className="btn header-item noti-icon waves-effect"
          tag="button"
          id="page-header-notifications-dropdown"
        >
          <i className="mdi mdi-bell-outline"></i>
          <span className="badge bg-danger rounded-pill">3</span>
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 font-size-16"> {props.t("Notifications")} {props.t("(soon)")}</h6>
              </Col>
            </Row>
          </div>

          {/* <SimpleBar style={{ height: "230px" }}>
            <Link to="#" className="text-reset notification-item">
              <div className="d-flex">
                <div className="avatar-xs me-3">
                  <span className="avatar-title bg-success rounded-circle font-size-16">
                    <i className="mdi mdi-cart-outline"></i>
                  </span>
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{props.t("Your order is placed")}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-1">
                    {props.t("Dummy text of the printing and typesetting industry.")}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="#" className="text-reset notification-item">
              <div className="d-flex">
                <div className="avatar-xs me-3">
                  <span className="avatar-title bg-warning rounded-circle font-size-16">
                    <i className="mdi mdi-message-text-outline"></i>
                  </span>
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{props.t("New Message received")}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-1">{props.t("You have 87 unread messages")}</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="#" className="text-reset notification-item">
              <div className="d-flex">
                <div className="avatar-xs me-3">
                  <span className="avatar-title bg-info rounded-circle font-size-16">
                    <i className="mdi mdi-glass-cocktail"></i>
                  </span>
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{props.t("Your item is shipped")}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-1">
                    {props.t("It is a long established fact that a reader will")}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="#" className="text-reset notification-item">
              <div className="d-flex">
                <div className="avatar-xs me-3">
                  <span className="avatar-title bg-primary rounded-circle font-size-16">
                    <i className="mdi mdi-cart-outline"></i>
                  </span>
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{props.t("Your order is placed")}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-1">
                    {props.t("Dummy text of the printing and typesetting industry.")}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="#" className="text-reset notification-item">
              <div className="d-flex">
                <div className="avatar-xs me-3">
                  <span className="avatar-title bg-danger rounded-circle font-size-16">
                    <i className="mdi mdi-message-text-outline"></i>
                  </span>
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{props.t("New Message received")}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-1">{props.t("You have 87 unread messages")}</p>
                  </div>
                </div>
              </div>
            </Link>
          </SimpleBar> */}
          <div className="p-2 border-top d-grid">
            <Link
              className="btn btn-sm btn-link font-size-14 btn-block text-center"
              to="#"
            >
              <i className="mdi mdi-arrow-right-circle me-1"></i>
              {" "}
              {props.t("View all")}{" "}
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withTranslation()(NotificationDropdown);

NotificationDropdown.propTypes = {
  t: PropTypes.any
};