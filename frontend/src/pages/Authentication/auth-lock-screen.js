// import PropTypes from 'prop-types';
// import React, { useState, useEffect, useContext } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// import {
//   Container,
//   Row,
//   Col,
//   CardBody,
//   Card,
//   Form,
//   FormFeedback,
//   Input,
//   Alert
// } from "reactstrap";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// import AuthContext from "context/AuthContext";

// import logo from "../../assets/images/logo-sm.png";
// import avatar from "../../assets/images/users/user-1.jpg";

// const LockScreen = () => {
//   const { login, isLoading, error } = useContext(AuthContext);  

//   useEffect(() => {
//     const storedUsername = localStorage.getItem("authUsername");
//     if (storedUsername) {
//       setName(storedUsername);
//     }
//   }, []);
  
//   const { t } = useTranslation();

//   const validation = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       password: '',
//     },
//     validationSchema: Yup.object({
//       password: Yup.string().required("Please Enter Password"),
//     }),
//     onSubmit: (values) => {
//       unlockHandler(values.password); 
//     }
//   });

//   const unlockHandler = (password) => {
//     login({ username: name, password });
//   };

//   document.title = "Lock Screen | Tijuana - Tzuchitech";

//   return (
//     <React.Fragment>
//       <div className="home-btn d-none d-sm-block">
//         <Link to="/dashboard" className="text-dark">
//         </Link>
//       </div>
//       <div className="account-pages my-5 pt-sm-5">
//         <Container>
//           <Row className="justify-content-center">
//             <Col md="8" lg="6" xl="4">
//               <Card className="overflow-hidden">
//                 <div className="bg-primary">
//                   <div className="text-primary text-center p-4">
//                     <h5 className="text-white font-size-20">Locked</h5>
//                     <p className="text-white-50">
//                       Hello {name}, enter your password to unlock the screen!
//                     </p>
//                     <Link to="/dashboard" className="logo logo-admin">
//                       <img src={logo} height="24" alt="logo" />
//                     </Link>
//                   </div>
//                 </div>
//                 <CardBody className="p-4">
//                   <div className="p-3">
//                     <Form className="mt-4"
//                       onSubmit={(e) => {
//                         e.preventDefault();
//                         validation.handleSubmit();
//                         return false;
//                       }}
//                       action="#">
//                       <div className="pt-3 text-center">
//                         <img src={avatar} className="rounded-circle img-thumbnail avatar-lg" alt="thumbnail" />
//                         <h6 className="font-size-16 mt-3">{name}</h6>
//                       </div>

//                       <div className="mb-3">
//                         <label className="form-label" htmlFor="userpassword">Password</label>
//                         <Input
//                           name="password"
//                           className="form-control"
//                           placeholder="Enter password"
//                           type="password"
//                           id="password"
//                           onChange={validation.handleChange}
//                           onBlur={validation.handleBlur}
//                           value={validation.values.password || ""}
//                           invalid={
//                             validation.touched.password && validation.errors.password ? true : false
//                           }
//                         />
//                         {validation.touched.password && validation.errors.password ? (
//                           <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
//                         ) : null}
//                       </div>

//                       <div className="row mb-0">
//                         <div className="col-12 text-end">
//                           <button className="btn btn-primary w-md waves-effect waves-light" type="submit">
//                             {isLoading ? t("Loading...") : t("Unlock")}
//                           </button>
//                         </div>
//                       </div>
                      //                       {error && (
//                         <Alert color="danger" className="mt-3">
//                           {error}
//                         </Alert>
//                       )}

//                     </Form>

//                   </div>
//                 </CardBody>
//               </Card>
//               <div className="mt-5 text-center">
//                 <p>
//                 {new Date().getFullYear()} Tijuna 
//                 <span className="d-none d-sm-inline-block">
//                 {" "}- {t("Crafted with")} {" "}
//                 <i className="mdi mdi-heart text-danger"></i>{" "}
//                 {t("by Tzu CHI TECH Türkiye")}.
//               </span>
                 
//                 </p>
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </React.Fragment>
//   );
// };

// export default LockScreen;
