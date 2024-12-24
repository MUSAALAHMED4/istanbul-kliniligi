import { Col, Row, Spinner } from "reactstrap";

function LoadingSpinner() {
  return (
    <Row className="justify-content-center p-5">
      <Col xs="auto">
        <Spinner color="primary" />
      </Col>
    </Row>
  );
}

export default LoadingSpinner;
