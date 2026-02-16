import React from "react";

export const FormInput = ({
  label,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  required = false,
  options = [],
  disabled = false,
  className = "",
  rows = 4,
}) => {
  const baseClass = `form-control ${className}`;

  if (type === "select") {
    return (
      <div className="mb-3">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}
        <select
          className={baseClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="mb-3">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}
        <textarea
          className={baseClass}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          rows={rows}
        />
      </div>
    );
  }

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        className={baseClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};

export default FormInput;
