import React from "react";
import Button from "./Button";

export function EmptyState({
  icon = "✓",
  title = "No data found",
  description = "There are no items to display at this time.",
  actionText,
  onAction,
  className = ""
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && onAction && (
        <div style={{ marginTop: "16px" }}>
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
