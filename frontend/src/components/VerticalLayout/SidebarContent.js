import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef, useState } from "react";

// //Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import withRouter from "components/Common/withRouter";
import { Link, useLocation } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";

const SidebarContent = (props) => {
  const location = useLocation();
  const ref = useRef();
  const path = location.pathname;

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag
        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };


  // Use RTL layout
  const [rtlDirection, setRtlDirection] = useState("ltr");
  useEffect(() => {
    setRtlDirection(props.i18n.language === "ar" ? "rtl" : "ltr");
  }, [props.i18n.language]);




  const activeMenu = useCallback(() => {
    let pathName = location.pathname;
    if (pathName === "/") {
      pathName = "/dashboard";
    }

    if (pathName.includes("individual") || pathName.includes("family")) {
      pathName = "/families";
    }

    if (pathName.includes("visit")) {
      pathName = "/visits";
    }

    if (pathName.includes("volunteer")) {
      pathName = "/volunteers";
    }

    const fullPath = pathName;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (fullPath === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  const isEmployee = localStorage.getItem("userType") === "employee";

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}  >
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {/* <li className="menu-title">{props.t("Main")} </li> */}

            {isEmployee && (
              <li>
                <Link to="/dashboard" className="waves-effect">
                  <i className="ti-home"></i>
                  {/* <span className="badge rounded-pill bg-primary float-end">1</span> */}
                  <span>{props.t("Dashboard")}</span>
                </Link>
              </li>
            )}

            {/* <li>
              <Link to="/email-inbox" className="waves-effect">
                <i className="ti-email"></i>
                <span>{props.t("Email")}</span>
              </Link>
            </li> */}

            <li>
              <Link to="/visits" className="waves-effect">
                <i className="ti-calendar"></i>
                <span>{props.t("Visits")}</span>
              </Link>
            </li>
            {/* 
            <li>
              <Link to="/individuals" className="waves-effect">
                <i className="fas fa-user-alt"></i>
                <span>Individuals</span>
              </Link>
            </li> */}
            {isEmployee && (
              <li>
                <Link to="/families" className="waves-effect">
                  <i className="mdi mdi-human-male-child"></i>
                  <span>{props.t("Families & Individuals")}</span>
                </Link>
              </li>
            )}

            {isEmployee && (
              <li>
                <Link to="/volunteers" className="waves-effect">
                  <i className="fas fa-user-edit"></i>
                  <span>{props.t("Volunteers")}</span>
                </Link>
              </li>
            )}

            {!isEmployee && (
              <li>
                <Link to="/events" className=" waves-effect">
                  <i className="fas fa-hand-holding-heart"></i>
                  <span>{props.t("Events")}</span>
                </Link>
              </li>
            )}

            {isEmployee && (
              <li>
                <Link to="#" className="has-arrow waves-effect">
                  <i className="fas fa-hand-holding-heart"></i>
                  <span>{props.t("Supports")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  {/* <li>
                  <Link to="/supports">Supports</Link>
                </li> */}
                  <li>
                    <Link to="/support-types">{props.t("Support Types")}</Link>
                  </li>
                  <li>
                    <Link to="/support-criteria">
                      {props.t("Supports Criteria")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/events">{props.t("Events")}</Link>
                  </li>
                </ul>
              </li>
            )}

            {isEmployee && (
              <li>
                <Link to="#" className="has-arrow waves-effect">
                  <i className="fas fa-file-alt"></i>
                  <span>{props.t("Reports")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/individual-reports">
                      {props.t("Individuals Reports")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/family-reports">
                      {props.t("Family Reports")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/support-reports">
                      {props.t("Support Reports")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/event-reports">
                      {props.t("Event Reports")}
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
