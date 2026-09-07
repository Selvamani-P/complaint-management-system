import React from "react";

export function StatCard({ title, value, description, icon, actionLabel, onAction }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div style={{ flex: 1 }}>
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value}</div>
        </div>

        {icon && <div className="stat-icon" aria-hidden="true">{icon}</div>}
      </div>

      {(description || actionLabel) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", gap: "8px" }}>
          {description && <div className="stat-description" style={{ margin: 0 }}>{description}</div>}
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--primary-600)",
                cursor: onAction ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px"
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;