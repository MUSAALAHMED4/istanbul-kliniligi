import React, { useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./ChangeProfilePicture.css";
const ChangeProfilePicture = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [zoom, setZoom] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setModalIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    console.log("Cropping complete");
  };

  return (
    <div className="change-profile-picture">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="imageInput"
      />
      <label htmlFor="imageInput">
        <Button color="primary">{t("Choose Profile Picture")}</Button>
      </label>

      <Modal isOpen={modalIsOpen} toggle={() => setModalIsOpen(!modalIsOpen)} centered>
        <ModalBody>
          <div className="modal-header">
            <h5>{t("Choose a Profile Picture")}</h5>
          </div>
          <div className="image-crop-container">
            {selectedImage && (
              <ReactCrop
                src={selectedImage}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                style={{ maxHeight: '400px', borderRadius: '50%' }}
              />
            )}
          </div>

          <div className="zoom-slider">
            <label>{t("Zoom")}:</label>
            <input
              type="range"
              value={zoom}
              min="1"
              max="3"
              step="0.1"
              onChange={(e) => setZoom(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between mt-3">
            <Button color="primary" onClick={handleCropComplete}>
              {t("Save")}
            </Button>
            <Button color="secondary" onClick={() => setModalIsOpen(false)}>
              {t("Cancel")}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ChangeProfilePicture;
