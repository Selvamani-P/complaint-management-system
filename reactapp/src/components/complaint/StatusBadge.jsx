import React from "react";

export function StatusBadge({ status = "PENDING", className = "" }) {
  const norm = (status || "PENDING").toUpperCase().replace(/\s+/g, "_");

  const statusMap = {
    PENDING: { label: "Pending", className: "status-pending" },
    ASSIGNED: { label: "Assigned", className: "status-assigned" },
    IN_PROGRESS: { label: "In Progress", className: "status-progress" },
    RESOLVED: { label: "Resolved", className: "status-resolved" },
    CLOSED: { label: "Closed", className: "status-closed" },
    REJECTED: { label: "Rejected", className: "status-danger" }
  };

  const badge = statusMap[norm] || { label: status, className: "status-pending" };

  return (
    <span className={`status ${badge.className} ${className}`}>
      <span className="status-dot" aria-hidden="true">●</span>
      <span>{badge.label}</span>
    </span>
  );
}

export default StatusBadge;
