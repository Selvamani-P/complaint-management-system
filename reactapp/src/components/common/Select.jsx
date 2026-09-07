import React from "react";

export const Select = React.forwardRef(function Select(
  {
    label,
    id,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`form-select ${error ? "input-error" : ""}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children ||
          options.map((opt) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const text = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
      </select>
      {error && <span className="form-error-msg">{error}</span>}
      {helperText && !error && <span className="form-help">{helperText}</span>}
    </div>
  );
});

export default Select;
