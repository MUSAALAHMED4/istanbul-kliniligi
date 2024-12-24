import React, {useContext, useState} from "react";

import {Card, CardBody, Col, Container, Form, Input, Label, Row, FormFeedback, Alert} from "reactstrap";

import AuthContext from "context/AuthContext";

import {Link, Navigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isUserAuthenticated } from "../../helpers/auth";

import "./style.css";


// import images
import logoSm from "../../assets/images/logo-sm.png";
import useAuth from "../../hooks/useAuth";

const Login = () => {

    const { t } = useTranslation();
    const {login, isLoading, error} = useContext(AuthContext);
    const {isLoggedIn} = useAuth();
    document.title = "Login | Tijuana - Tzuchitech";

    if (isUserAuthenticated()) {
        return <Navigate to="/" replace={true} />;
    }

    const submitHandler = (e) => {
        e.preventDefault();
        login(e);
    };

    if (isLoggedIn()) {
        return <Navigate to="/" replace={true}/>;
    }

    return (
        <React.Fragment>
            <div className="home-btn d-none d-sm-block">
                <Link to="/" className="text-dark">
                    <i className="fas fa-home h2"/>
                </Link>
            </div>
            <div className="account-pages my-5 pt-sm-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={4}>
                            <Card className="overflow-hidden">
                                <div className="bg-primary">
                                    <div className="text-primary text-center p-4">
                                        <h5 className="text-white font-size-20">{t("Welcome Back !")}</h5>
                                        <p className="text-white-50">
                                        {t("Sign in to continue to tijuana.")}
                                        </p>
                                        <Link to="/" className="logo logo-admin">
                                            <img src={logoSm} height="24" alt="logo"/>
                                        </Link>
                                    </div>
                                </div>

                                <CardBody className="p-4">
                                    <div className="p-3">
                                        <Form className="mt-4" onSubmit={submitHandler} action="#">
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="username">
                                                {t("Username")}
                                                </Label>
                                                <Input
                                                    name="username"
                                                    className="form-control"
                                                    placeholder={t("Enter Username")}
                                                    type="text"
                                                    id="username"
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="userpassword">
                                                {t("Password")}
                                                </Label>
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    className="form-control"
                                                    placeholder={t("Enter Password")}
                                                />
                                            </div>

                                            <div className="mb-3 row">
                                                <div className="col-sm-6">
                                                    {/* <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="customControlInline"
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="customControlInline"
                                                        >
                                                           {t("Remember me")}
                                                        </label>
                                                    </div> */}
                                                </div>
                                                <div className="col-sm-6 text-end">
                                                    <button
                                                        className="btn btn-primary w-md waves-effect waves-light"
                                                        type="submit"
                                                    >
                                                        {isLoading ? t("Loading...") : t("Log In")}
                                                    </button>
                                                </div>
                                            </div>
                                            {/* <div className="mt-2 mb-0 row">
                                                <div className="col-12 mt-4">
                                                    <Link to="/forgot-password">
                                                        <i className="mdi mdi-lock"></i> {t("Forgot your password?")}
                                                    </Link>
                                                </div>
                                            </div> */}
                                            {error &&
                                                <Alert color="danger" className="mb-0">
                                                    <strong>{t("Erorr")}: </strong> {error}
                                                </Alert> }
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Login;