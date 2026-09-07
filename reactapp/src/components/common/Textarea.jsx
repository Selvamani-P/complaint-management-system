import React from "react";

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    id,
    name,
    value,
    onChange,
    rows = 4,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  const textareaId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`form-textarea ${error ? "input-error" : ""}`}
        {...props}
      />
      {error && <span className="form-error-msg">{error}</span>}
      {helperText && !error && <span className="form-help">{helperText}</span>}
    </div>
  );
});

export default Textarea;
