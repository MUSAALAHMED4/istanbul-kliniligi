import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NonAuthLayout = ({ children }) => {
  const location = useLocation();

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // React's equivalent of componentDidMount for setting document title
  useEffect(() => {
    let currentage = capitalizeFirstLetter(location.pathname);
    document.title = `${currentage} | Tijuana`;
  }, [location.pathname]);

  return <>{children}</>;
};

NonAuthLayout.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object,
};

export default NonAuthLayout;
