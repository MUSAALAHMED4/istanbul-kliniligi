import PropTypes from 'prop-types';
import React from "react";
import { Routes, Route } from 'react-router-dom';
import { connect } from "react-redux";
import { AuthProvider } from 'context/AuthContext';
import ErrorBoundary from "./pages/Utility/ErrorBoundary";



// Import Routes all
import { userRoutes, authRoutes } from "./routes/allRoutes";

// Import all middleware
import Authmiddleware from "./routes/middleware/Authmiddleware";

// layouts Format
import NonAuthLayout from "./components/NonAuthLayout";

// Import scss
import "./assets/scss/theme.scss";


// Import 404, 500, and Maintenance pages
import Pages404 from "./pages/Utility/pages-404"; 
import Pages500 from "./pages/Utility/pages-500";
import PagesMaintenance from "./pages/Utility/pages-maintenance"; 
import PagesError from "./pages/Utility/PagesError";





const App = () => {

  // Check for maintenance mode
  const isMaintenanceMode = false;


 
  
  return (
    <AuthProvider>
    <React.Fragment>
      <Routes>
      {isMaintenanceMode ? (
            // Routes for maintenance
            <Route path="*" element={<PagesMaintenance />} />
          ) : (
            <>

          {authRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <NonAuthLayout>
                  {route.component}
                </NonAuthLayout>
              }
              key={idx}
              exact={true}
            />
          ))}
      
        <Route>
          {userRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Authmiddleware>
                  {route.component}
                </Authmiddleware>}
              key={idx}
              exact={true}
            />
          ))}
          </Route>
          {/* Route for 404 page */}
          <Route path="*" element={<Pages404 />} />

          {/* Error page */}
          <Route path="/error" element={<PagesError />} />

          {/* Route for 500 page */}
          <Route path="/500" element={<Pages500 />} />
          </>
          )}
          
      </Routes>
      </React.Fragment>
      </AuthProvider>
  );
};

App.propTypes = {
  layout: PropTypes.any
};

const mapStateToProps = state => {
  return {
    layout: state.Layout,
  };
};

export default connect(mapStateToProps, null)(App);
