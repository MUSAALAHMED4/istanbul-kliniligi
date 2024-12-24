import React from "react";

// Profile
import UserProfile from "../pages/Authentication/user-profile";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import LockScreen from "../pages/Authentication/auth-lock-screen";

//emergency
import Emergency from "../pages/Emergency/Emergency";
import ReportPage from "../pages/Emergency/ReportPage";
import CreateEditEmergency from "../pages/Emergency/CreateEditEmergency";

//Utility
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";
import PagesError from "../pages/Utility/PagesError";


// Dashboard
import Dashboard from "../pages/Dashboard";

// Visits
import Visits from "pages/Visits";
import VisitDetails from "pages/Visits/visitDetails";
import CreateVisit from "pages/Visits/createVisit";

// Volunteer
import Volunteers from "pages/Volunteers";
import CreateOrEditVolunteer from "pages/Volunteers/CreateOrEditVolunteer";

// Families
import Families from "pages/Families";
import FamilyDetails from "pages/Families/familyDetails";
import FamilyInformation from "pages/Families/familyinformation";
import FamilyReport from "pages/Families/FamilyReport";


// import CreateFamily from "pages/Families/createFamily";
// Individuals
import Individuals from "pages/Individuals";
import CreateOrEditIndividual from "pages/Individuals/createOrEditIndividual";
// Supports
import SupportTypes from "pages/Support/supportTypes";
import SupportEvents from "pages/Support/supportEvents";
import CreateSupport from "pages/Support/CreateSupport";
import SupportDetails from "pages/Support/SupportDetails";
import CreateSupportType from "pages/Support/CreateSupportType";
import SupportCriteria from "pages/Support/SupportCriteria";
import CreateSupportCriteria from "pages/Support/CreateSupportCriteria";
import SupportCriteriaDetails from "pages/Support/SupportCriteriaDetails";

// support events
import CreateSupportEvent from "pages/Support/CreateSupportEvent";
import EditSupportEvent from "pages/Support/EditSupportEvent";
import SupportEventDetails from "pages/Support/SupportEventDetails";

// Email
import EmailInbox from "pages/Email/email-inbox";
import EmailRead from "pages/Email/email-read";
import EmailCompose from "pages/Email/email-compose";


// Reports
import IndividualsReports from "pages/report/individualsReports";
import FamilyReports from "pages/report/FamilyReports";
import SupportReports from "pages/report/SupportReports";
import EventReports from "pages/report/EventReports";




const userRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  // Visit
  { path: "/visits", component: <Visits /> },
  { path: "/visit/:id", component: <VisitDetails /> },
  { path: "/visit/new", component: <CreateVisit /> },

  // Individuals
  { path: "/individuals", component: <Individuals /> },
  // { path: "/individual-details", component: <IndividualDetails /> },
  { path: "/individual/:id", component: <CreateOrEditIndividual /> },

  // Families
  { path: "/families", component: <Families /> },
  { path: "/family/:id", component: <FamilyDetails /> },
  { path: "/familyinfo/:id", component: <FamilyInformation /> },
  { path: "/families/:familyId/report", component: <FamilyReport /> } ,
  // { path: "/create-family", component: <CreateFamily /> },

  // Volunteers
  { path: "/volunteers", component: <Volunteers /> },
  { path: "/volunteer/:id", component: <CreateOrEditVolunteer /> },

  // Supports
  // { path: "/supports", component: <Supports /> },
  { path: "/create-support", component: <CreateSupport /> },
  { path: "/support/:id", component: <SupportDetails /> },
  { path: "/support-types", component: <SupportTypes /> },
  { path: "/support-type/:id", component: <CreateSupportType /> },
  { path: "/create-support-type", component: <CreateSupportType /> },

  { path: "/events", component: <SupportEvents /> },
  { path: "/events/new", component: <CreateSupportEvent /> },
  { path: "/event/:id/edit", component: <EditSupportEvent /> },
  { path: "/event/:id", component: <SupportEventDetails /> },

  { path: "/support-criteria", component: <SupportCriteria /> },
  { path: "/support-criteria/new", component: <CreateSupportCriteria /> },
  { path: "/support-criteria/:id", component: <SupportCriteriaDetails /> },

  //Email
  { path: "/email-inbox", component: <EmailInbox /> },
  { path: "/email-read/:emailId", component: <EmailRead /> },
  { path: "/email-compose", component: <EmailCompose /> },

  //emergency
  { path: "/families/emergency", component: <Emergency /> },
  { path: "/families/:familyId/emergency/ReportPage/:id", component: <ReportPage /> },
  { path: "/families/:familyId/emergency/:id", component: <CreateEditEmergency /> },
  // { path: "/families/emergency/CreateEmergency", component: <CreateEmergency /> },
  
  // //profile
  { path: "/profile", component: <UserProfile /> },



  //reports
  { path: "/individual-reports", component: <IndividualsReports /> },
  { path: "/family-reports", component: <FamilyReports /> },
  { path: "/support-reports", component: <SupportReports /> },
  { path: "/event-reports", component: <EventReports /> },


  // this route should be at the end of all other routes
  { path: "/", component: <Dashboard /> },
];


 

const authRoutes = [
  { path: "/error", component: <PagesError /> },
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
];

export { userRoutes, authRoutes };
