import React from "react";
import { X } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  centered = true,
  backdrop = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: "modal-sm",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="modalTitle"
      aria-hidden="true"
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-dialog ${sizeClasses[size] || "modal-lg"} ${
          centered ? "modal-dialog-centered" : ""
        }`}
        role="document"
      >
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitle">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
