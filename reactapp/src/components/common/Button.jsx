import React from "react";
import Spinner from "./Spinner";

export function Button({
  children,
  type = "button",
  variant = "primary", // primary, secondary, danger, text
  loading = false,
  disabled = false,
  icon = null,
  className = "",
  onClick,
  ...props
}) {
  const variantClass = {
    primary: "primary-button",
    secondary: "secondary-button",
    danger: "danger-button",
    text: "text-button"
  }[variant] || "primary-button";

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={16} color="currentColor" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
