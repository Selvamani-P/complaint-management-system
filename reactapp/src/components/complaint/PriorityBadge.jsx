import React from "react";

export function PriorityBadge({ priority = "MEDIUM", className = "" }) {
  const norm = (priority || "MEDIUM").toUpperCase();

  const priorityMap = {
    LOW: { label: "Low", className: "priority-low" },
    MEDIUM: { label: "Medium", className: "priority-medium" },
    HIGH: { label: "High", className: "priority-high" },
    CRITICAL: { label: "Critical", className: "priority-critical" }
  };

  const badge = priorityMap[norm] || { label: priority, className: "priority-medium" };

  return (
    <span className={`priority-badge ${badge.className} ${className}`}>
      <span className="priority-dot" aria-hidden="true">●</span>
      <span>{badge.label}</span>
    </span>
  );
}

export default PriorityBadge;
