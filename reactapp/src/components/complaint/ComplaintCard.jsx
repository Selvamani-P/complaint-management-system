import React from "react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export function ComplaintCard({ complaint, onClick }) {
  if (!complaint) return null;

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: "pointer", marginBottom: "12px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--primary-600)" }}>
            #{complaint.id}
          </span>
          <h4 style={{ margin: "4px 0", fontSize: "15px", color: "var(--slate-900)" }}>
            {complaint.title}
          </h4>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p
        style={{
          margin: "8px 0 12px",
          fontSize: "13px",
          color: "var(--slate-600)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
      >
        {complaint.description}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "var(--slate-500)",
          paddingTop: "8px",
          borderTop: "1px solid var(--border-color)"
        }}
      >
        <span>{complaint.category || "General"}</span>
        {complaint.priority && <PriorityBadge priority={complaint.priority} />}
      </div>
    </div>
  );
}

export default ComplaintCard;
