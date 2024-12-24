import { Row } from "reactstrap";
import { useTranslation } from "react-i18next";

function ErrorMessage({ message }) {
  const { t } = useTranslation();
  return (
    <Row className="justify-content-center p-5">
      <p
        style={{
          width: "600px",
          padding: "10px",
          border: "1px solid #ced4da",
          borderRadius: "4px",
          textAlign: "center",
          backgroundColor: "#f8d7da",
          color: "#721c24",
        }}
      >
         {t("An Error Occurred!")} - {message}
      </p>
    </Row>
  );
}

export default ErrorMessage;
