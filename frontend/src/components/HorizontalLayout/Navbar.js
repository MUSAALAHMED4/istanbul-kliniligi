import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import withRouter from "components/Common/withRouter";
import classname from "classnames";

//i18n
import { withTranslation } from "react-i18next";

import { connect } from "react-redux";

const Navbar = props => {
  const [email, setemail] = useState(false);

  useEffect(() => {
    var matchingMenuItem = null;
    var ul = document.getElementById("navigation");
    var items = ul.getElementsByTagName("a");
    removeActivation(items);
    for (var i = 0; i < items.length; ++i) {
      if (window.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  });

  const removeActivation = items => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        if (parent.classList.contains("active")) {
          parent.classList.remove("active");
        }
      }
    }
  };

  function activateParentDropdown(item) {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  return (
    <React.Fragment>
      <div className="topnav">
        <div className="container-fluid">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse
              isOpen={props.leftMenu}
              className="navbar-collapse"
              id="topnav-menu-content"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/dashboard"
                  >
                    <i className="ti-home me-2" />
                    {props.t("Dashboard")} {props.menuOpen}
                  </Link>
                </li>





                <li className="nav-item">
                  <Link
                    to="/visits"
                    className="nav-link"
                  >
                    <i className="ti-calendar me-2"></i>
                    {props.t("Visits")}
                  </Link>
                </li>







                <li className="nav-item">
                  <Link
                    to="/Families"
                    className="nav-link"
                  >
                    <i className="mdi mdi-human-male-child me-2"></i>
                    {props.t("Families")}
                  </Link>
                </li>

      


                <li className="nav-item">
                  <Link
                    to="/volunteers"
                    className="nav-link"
                  >
                    <i className="fas fa-user-edit me-2"></i>
                    {props.t("volunteers")}
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle arrow-none" to="#"
                    onClick={e => {
                      e.preventDefault();
                      setemail(!email);
                    }}
                  >
                    <i className="fas fa-hand-holding-heart me-2"></i>
                    {props.t("Supports")}
                  </Link>
                  <div className={classname("dropdown-menu", {
        
                  })} aria-labelledby="topnav-emailtemplates">
                    <Link
                      to="#"
                      className="dropdown-item"
                    >
                      <Link to="/support-types">{props.t("Support Types")}</Link>
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item"
                    >
                      <Link to="/support-criteria">{props.t("Supports Criteria")}</Link>
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item"
                    >
                      <Link to="/events">{props.t("Events")}</Link>

                    </Link>
                  </div>
                </li>

              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
};

Navbar.propTypes = {
  leftMenu: PropTypes.any,
  location: PropTypes.any,
  menuOpen: PropTypes.any,
  t: PropTypes.any,
};

const mapStatetoProps = state => {
  const { leftMenu } = state.Layout;
  return { leftMenu };
};

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(Navbar))
);
