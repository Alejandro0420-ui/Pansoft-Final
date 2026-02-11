import React from "react";

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options,
  ...props
}) {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {type === "select" ? (
        <select
          className={`form-select ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          <option value="">{placeholder || "Seleccionar..."}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          {...props}
        />
      )}
      {error && <span className="invalid-feedback d-block">{error}</span>}
    </div>
  );
}
