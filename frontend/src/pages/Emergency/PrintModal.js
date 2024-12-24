import React from "react";

const PrintModal = ({ isVisible, onConfirm, onCancel, t }) => {
  if (!isVisible) return null;

  return (
    <div
      className="modal bs-example-modal"
      tabIndex="-1"
      onClick={(e) => {
        if (e.target.className === "modal bs-example-modal") {
          onCancel();
        }
      }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t("Print Confirmation")}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p style={{ textAlign: "center" }}>
              <span>{t("Are you sure you want to print this request?")}</span>
              <span style={{ display: "block", marginTop: "10px" }}>
                {t(
                  "Once printed, you cannot delete or modify this request, and you won't be able to print another request until it is approved or rejected by the responsible authority."
                )}
              </span>
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
            >
              {t("Yes, Print")}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
