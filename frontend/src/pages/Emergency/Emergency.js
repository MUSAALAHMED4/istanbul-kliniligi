import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Alert, FormGroup, Label, Row, Col } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import instance from 'base_url';

const Emergency = ({ isOpen, toggle, familyId }) => {
  const { t } = useTranslation();
  const [situationType, setSituationType] = useState('');
  const [description, setDescription] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (situationType) {
      const descriptionText = document.getElementById("description").value; 
      const emergency = await instance.post(`emergency-situation/`, { description: descriptionText, support_category: situationType, family_id: familyId });
      const emergencyId = emergency.data.id;
      navigate(`/families/${familyId}/emergency/${emergencyId}`);
    } else {
      setAlertVisible(true); 
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{t("Emergency Details")}</ModalHeader>
      <ModalBody>
        <FormGroup tag="fieldset">
          <legend>{t("Select Situation Type")}</legend>
          <Row>
            <Col md={6}>
              <Button 
                color="primary" 
                block 
                onClick={() => setSituationType('relief')}
                active={situationType === 'relief'}
              >
                {t("Relief")}
              </Button>
            </Col>
            <Col md={6}>
              <Button 
                color="danger" 
                block 
                onClick={() => setSituationType('medical')}
                active={situationType === 'medical'}
              >
                {t("Medical")}
              </Button>
            </Col>
          </Row>
        </FormGroup>

        <FormGroup className="mt-4">
          <Label for="description">{t("Describe the Situation")}</Label>
          <Input
            type="textarea"
            id="description"
            placeholder={t("Enter details here...")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </FormGroup>

        {alertVisible && (
          <Alert color="danger" className="mt-3">
            {t("Please fill out all fields before proceeding!")}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="info" onClick={handleSave}>
          <i className="fa fa-save me-2"></i> {t("Save")}
        </Button>
        <Button color="secondary" onClick={toggle}>
          {t("Close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Emergency;
