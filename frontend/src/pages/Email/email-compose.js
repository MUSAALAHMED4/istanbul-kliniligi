import React from "react";
import { Row, Col, Card, Input, Container } from "reactstrap";

//Import Email Sidebar
import EmailSideBar from "./email-sidebar";
import { Editor } from "react-draft-wysiwyg";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

// i18n
import { useTranslation } from 'react-i18next';

const EmailCompose = () => {
    const { t } = useTranslation(); 
    document.title = t("Email Compose") + " | tijuana - React Admin & Dashboard Template";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* Render Breadcrumbs */}
                    <Breadcrumbs maintitle={t("tijuana")} title={t("Email")} breadcrumbItem={t("Compose Email")} />
                    <Row>
                        <Col xs="12">
                            {/* Render Email SideBar */}
                            <EmailSideBar />

                            <div className="email-rightbar mb-3">
                                <Card>
                                    <div className="card-body">

                                        <div>
                                            <div className="mb-3">
                                                <Input type="email" className="form-control" placeholder={t("To")} />
                                            </div>

                                            <div className="mb-3">
                                                <Input type="text" className="form-control" placeholder={t("Subject")} />
                                            </div>
                                            <div className="mb-3">
                                                <form method="post">
                                                    <Editor
                                                        toolbarClassName="toolbarClassName"
                                                        wrapperClassName="wrapperClassName"
                                                        editorClassName="editorClassName"
                                                    />
                                                </form>
                                            </div>

                                            <div className="btn-toolbar form-group mb-0">
                                                <div className="">
                                                    <button type="button" className="btn btn-success waves-effect waves-light me-1">
                                                        <i className="fa fa-save"></i> {t("Save")}
                                                    </button>
                                                    <button type="button" className="btn btn-danger waves-effect waves-light me-1">
                                                        <i className="fa fa-trash-alt"></i> {t("Discard")}
                                                    </button>
                                                    <button className="btn btn-purple waves-effect waves-light">
                                                        <span>{t("Send")}</span> <i className="fab fa-telegram-plane ms-2"></i>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default EmailCompose;
