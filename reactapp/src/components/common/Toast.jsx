import React, { useEffect } from "react";
import Icon from "./Icon";

export function Toast({ toasts = [], onDismiss }) {
  useEffect(() => {
    if (toasts && toasts.length > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" role="status">
      {toasts.map((toast) => {
        const type = toast.type || "info";
        const iconName = type === "success" ? "check" : type === "error" ? "alert" : "info";
        return (
          <div key={toast.id} className={`toast toast-${type}`}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon name={iconName} size={18} />
              <span>{toast.message}</span>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--slate-400)",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label="Dismiss notification"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
