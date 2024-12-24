import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import instance from 'base_url';  
import { MEDIA_URL } from "../../configs";  

const Treearchive = ({ isOpen, toggle, familyId }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [treeLastModified, setTreeLastModified] = useState(null);  

  useEffect(() => {
    const fetchImages = async () => {
      try {
         const response = await instance.get(`/family-archive/${familyId}`);
        console.log("Images response data:", response.data);  
        
         setImages(response.data);

       
        const treeModificationDate = response.data.treeModifiedDate || null; 
        setTreeLastModified(treeModificationDate);
      } catch (error) {
        console.error("Error fetching family archive images:", error);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, familyId]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>{t("Family Archive")}</ModalHeader>
      <ModalBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Row>
         
          <Col md={12} className="mb-4 text-center">
            <h5>{t("Family Tree")}</h5>
            {treeLastModified ? (
              <p className="text-center mb-2">
                {t("Last modified on")}: {new Date(treeLastModified).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-center mb-2">
                {t("Modification date not available")}
              </p>
            )}
            <img
              src={`${MEDIA_URL}genogram/${familyId}.png`} 
              alt="Family Tree" 
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Col>
        </Row>
        <Row>
          {images.length > 0 ? (
            images.map((image, index) => (
              <Col md={6} key={index} className="mb-4">
                <p className="text-center mb-2">
                  {t("Last modified on")}: {new Date(image.modifiedDate).toLocaleDateString()}
                </p>
                <img
                  src={image.url} 
                  alt={`Family Archive ${index}`}
                  className="img-fluid"
                />
              </Col>
            ))
          ) : (
            <Col md={12} className="text-center">
              <p>{t("No images available")}</p>
            </Col>
          )}
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          {t("Close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Treearchive;
