import React from "react";

export function AlertMessage({
  message,
  type = "info",
  onClose,
  dismissible = true,
}) {
  if (!message) return null;

  const typeClass =
    {
      success: "alert-success",
      error: "alert-danger",
      warning: "alert-warning",
      info: "alert-info",
    }[type] || "alert-info";

  return (
    <div
      className={`alert ${typeClass} ${dismissible ? "alert-dismissible fade show" : ""}`}
      role="alert"
    >
      {message}
      {dismissible && (
        <button type="button" className="btn-close" onClick={onClose}></button>
      )}
    </div>
  );
}
