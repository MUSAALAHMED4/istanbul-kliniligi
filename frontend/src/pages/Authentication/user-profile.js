import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { CardTitle } from "reactstrap";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Form,
  FormFeedback,
  Label,
  Input,
} from "reactstrap";

// Redux and actions
import { connect, useDispatch } from "react-redux";
import withRouter from 'components/Common/withRouter';
import Breadcrumb from "../../components/Common/Breadcrumb";
import { editProfile, resetProfileFlag } from "../../store/actions";
import AuthContext from "context/AuthContext";
import avatar from "../../assets/images/users/user-4.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const { logout, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [idx, setIdx] = useState(1);
  const [userType, setUserType] = useState("");
  const [username, setUsername] = useState('');
  

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
       if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
        setName(obj.displayName);
        setEmail(obj.email);
        setIdx(obj.uid || 1);
      } else if (
        process.env.REACT_APP_DEFAULTAUTH === "fake" ||
        process.env.REACT_APP_DEFAULTAUTH === "jwt"
      ) {
        setName(obj.displayName || obj.username || "No name available");
        setEmail(obj.email);
        setIdx(obj.uid || 1);
      }
    }
 
  

    const storedUserType = localStorage.getItem("userType");
    if (storedUserType) {
      setUserType(storedUserType);
    }

    setTimeout(() => {
      props.resetProfileFlag();
    }, 3000);
  }, [props.success]);

  const handleLogout = () => {
    logout();
  };

  const validationType = useFormik({
    initialValues: {
      currentPassword: '',
      password: '',
      password1: '',
    },
    validationSchema: Yup.object().shape({
      currentPassword: Yup.string().required(t("Current password is required")),
      password: Yup.string().required(t("New password is required")),
      password1: Yup.string().oneOf([Yup.ref("password")], t("Both passwords need to match")).required(t("Confirm new password is required")),
    }),
    onSubmit: (values) => {
      console.log("Password Change Values", values);
    }
  });

  const emailValidation = useFormik({
    initialValues: {
      currentEmail: email || '',
      newEmail: '',
      confirmEmail: '',
    },
    validationSchema: Yup.object().shape({
      currentEmail: Yup.string().email(t("Invalid email format")).required(t("Current email is required")),
      newEmail: Yup.string().email(t("Invalid email format")).required(t("New email is required")),
      confirmEmail: Yup.string().oneOf([Yup.ref("newEmail")], t("Emails must match")).required(t("Confirm new email is required")),
    }),
    onSubmit: (values) => {
      console.log("Email Change Values", values);
    }
  });

  const contactValidation = useFormik({
    initialValues: {
      phoneNumber: '',
      address: '',
    },
    validationSchema: Yup.object().shape({
      phoneNumber: Yup.string().required(t("Phone number is required")).matches(/^\d+$/, t("Phone number must be numeric")),
      address: Yup.string().required(t("Address is required")),
    }),
    onSubmit: (values) => {
      console.log("Contact Change Values", values);
    }
  });

  document.title = t("Profile | tijuana Dashboard");

  console.log("User", username);
  console.log("User Type", userType);

 
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title={t("tijuana")} breadcrumbItem={t("Profile")} />

          <Row>
            <Col lg="12">
              {props.error && <Alert color="danger">{props.error}</Alert>}
              {props.success && <Alert color="success">{props.success}</Alert>}

              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="mx-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="align-self-center flex-1">
                      <div className="text-muted">
                        <h5>{name}</h5>
                        <p className="mb-1">{email}</p>
                        <p className="mb-1">{t("Full Name")}: {user?.username || "No name available"}</p>
                        <p className="mb-0">
                          {t("User Name")}: {user?.username} {userType ? `${userType}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>{t("Change Password")}</CardTitle>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validationType.handleSubmit();
                      return false;
                    }}
                  >
                    <div className="mb-3">
                      <Label>{t("Current password")}</Label>
                      <Input
                        name="currentPassword"
                        type="password"
                        placeholder={t("Enter current password")}
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.currentPassword || ""}
                        invalid={validationType.touched.currentPassword && validationType.errors.currentPassword ? true : false}
                      />
                      {validationType.touched.currentPassword && validationType.errors.currentPassword && (
                        <FormFeedback type="invalid">{validationType.errors.currentPassword}</FormFeedback>
                      )}
                    </div>

                    <div className="mb-3">
                      <Label>{t("New password")}</Label>
                      <Input
                        name="password"
                        type="password"
                        placeholder={t("Enter new password")}
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.password || ""}
                        invalid={validationType.touched.password && validationType.errors.password ? true : false}
                      />
                      {validationType.touched.password && validationType.errors.password && (
                        <FormFeedback type="invalid">{validationType.errors.password}</FormFeedback>
                      )}
                    </div>

                    <div className="mb-3">
                      <Input
                        name="password1"
                        type="password"
                        placeholder={t("Re-type password")}
                        onChange={validationType.handleChange}
                        onBlur={validationType.handleBlur}
                        value={validationType.values.password1 || ""}
                        invalid={validationType.touched.password1 && validationType.errors.password1 ? true : false}
                      />
                      {validationType.touched.password1 && validationType.errors.password1 && (
                        <FormFeedback type="invalid">{validationType.errors.password1}</FormFeedback>
                      )}
                    </div>

                    <Button type="submit" color="primary">{t("Submit")}</Button>{" "}
                    <Button type="reset" color="secondary">{t("Cancel")}</Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle>{t("Change Email")}</CardTitle>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      emailValidation.handleSubmit();
                      return false;
                    }}
                  >
                    <div className="mb-3">
                      <Label>{t("Current email")}</Label>
                      <Input
                        name="currentEmail"
                        type="email"
                        placeholder={t("Enter current email")}
                        onChange={emailValidation.handleChange}
                        onBlur={emailValidation.handleBlur}
                        value={emailValidation.values.currentEmail || ""}
                        invalid={emailValidation.touched.currentEmail && emailValidation.errors.currentEmail ? true : false}
                      />
                      {emailValidation.touched.currentEmail && emailValidation.errors.currentEmail && (
                        <FormFeedback type="invalid">{emailValidation.errors.currentEmail}</FormFeedback>
                      )}
                    </div>

                    <div className="mb-3">
                      <Label>{t("New email")}</Label>
                      <Input
                        name="newEmail"
                        type="email"
                        placeholder={t("Enter new email")}
                        onChange={emailValidation.handleChange}
                        onBlur={emailValidation.handleBlur}
                        value={emailValidation.values.newEmail || ""}
                        invalid={emailValidation.touched.newEmail && emailValidation.errors.newEmail ? true : false}
                      />
                      {emailValidation.touched.newEmail && emailValidation.errors.newEmail && (
                        <FormFeedback type="invalid">{emailValidation.errors.newEmail}</FormFeedback>
                      )}
                    </div>

                    <div className="mb-3">
                      <Input
                        name="confirmEmail"
                        type="email"
                        placeholder={t("Re-type new email")}
                        onChange={emailValidation.handleChange}
                        onBlur={emailValidation.handleBlur}
                        value={emailValidation.values.confirmEmail || ""}
                        invalid={emailValidation.touched.confirmEmail && emailValidation.errors.confirmEmail ? true : false}
                      />
                      {emailValidation.touched.confirmEmail && emailValidation.errors.confirmEmail && (
                        <FormFeedback type="invalid">{emailValidation.errors.confirmEmail}</FormFeedback>
                      )}
                    </div>

                    <Button type="submit" color="primary">{t("Submit")}</Button>{" "}
                    <Button type="reset" color="secondary">{t("Cancel")}</Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <CardTitle>{t("Change Phone Number and Address")}</CardTitle>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      contactValidation.handleSubmit();
                      return false;
                    }}
                  >
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>{t("Phone Number")}</Label>
                          <Input
                            name="phoneNumber"
                            type="text"
                            placeholder={t("Enter phone number")}
                            onChange={contactValidation.handleChange}
                            onBlur={contactValidation.handleBlur}
                            value={contactValidation.values.phoneNumber || ""}
                            invalid={contactValidation.touched.phoneNumber && contactValidation.errors.phoneNumber ? true : false}
                          />
                          {contactValidation.touched.phoneNumber && contactValidation.errors.phoneNumber && (
                            <FormFeedback type="invalid">{contactValidation.errors.phoneNumber}</FormFeedback>
                          )}
                        </div>
                      </Col>

                      <Col md={4} className="d-flex align-items-end" style={{ marginBottom: '16px' }} >
                        <Button type="button" color="primary" onClick={contactValidation.handleSubmit}>
                          {t("Submit Phone Number")}
                        </Button>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label>{t("Address")}</Label>
                      <Input
                        name="address"
                        type="text"
                        placeholder={t("Enter address")}
                        onChange={contactValidation.handleChange}
                        onBlur={contactValidation.handleBlur}
                        value={contactValidation.values.address || ""}
                        invalid={contactValidation.touched.address && contactValidation.errors.address ? true : false}
                      />
                      {contactValidation.touched.address && contactValidation.errors.address && (
                        <FormFeedback type="invalid">{contactValidation.errors.address}</FormFeedback>
                      )}
                    </div>

                    <Button type="submit" color="primary">{t("Submit")}</Button>{" "}
                    <Button type="reset" color="secondary">{t("Cancel")}</Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button type="button" color="danger" onClick={handleLogout}>
              {t("Logout")}
            </Button>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

UserProfile.propTypes = {
  editProfile: PropTypes.func,
  error: PropTypes.any,
  success: PropTypes.any
};

const mapStatetoProps = (state) => {
  const { error, success } = state.Profile;
  return { error, success };
};

export default withRouter(
  connect(mapStatetoProps, { editProfile, resetProfileFlag })(UserProfile)
);
