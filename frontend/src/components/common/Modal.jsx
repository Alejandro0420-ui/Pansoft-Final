import React from "react";

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = "lg",
  footer,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      onClick={onClose}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "1rem",
      }}
    >
      <div
        className={`modal-dialog modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          zIndex: 1051,
          maxWidth: size === "sm" ? "500px" : size === "lg" ? "800px" : "600px",
          margin: "auto",
        }}
      >
        <div className="modal-content">
          <div
            className="modal-header"
            style={{ position: "relative", zIndex: 1051 }}
          >
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
