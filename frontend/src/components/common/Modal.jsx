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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className={`modal-dialog modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
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
