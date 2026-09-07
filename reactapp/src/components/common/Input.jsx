import React from "react";

export const Input = React.forwardRef(function Input(
  {
    label,
    id,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    rightElement = null,
    ...props
  },
  ref
) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input ${error ? "input-error" : ""}`}
          style={rightElement ? { paddingRight: "40px" } : {}}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: "10px",
              display: "flex",
              alignItems: "center"
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="form-error-msg">{error}</span>}
      {helperText && !error && <span className="form-help">{helperText}</span>}
    </div>
  );
});

export default Input;
