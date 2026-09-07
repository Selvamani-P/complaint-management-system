import React from "react";
import Icon from "./Icon";

export function Alert({ type = "info", message, onClose, className = "" }) {
  if (!message) return null;

  const iconName = {
    info: "info",
    success: "check",
    error: "alert",
    warning: "alert"
  }[type] || "info";

  const stateClass = type === "error" ? "error-state" : "success-state";

  return (
    <div
      className={`${stateClass} ${className}`}
      role="alert"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon name={iconName} size={16} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: "2px",
            display: "flex"
          }}
          aria-label="Dismiss alert"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

export default Alert;
