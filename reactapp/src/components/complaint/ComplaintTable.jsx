import React from "react";
import StatusBadge from "./StatusBadge";

export function ComplaintTable({ complaints = [], onRowClick }) {
  return (
    <div className="table-responsive">
      <div className="complaints-table">
        <div className="table-header">
          <span>ID</span>
          <span>Complaint</span>
          <span>Category</span>
          <span>Status</span>
        </div>

        {complaints.map((complaint) => (
          <div
            className="table-row"
            key={complaint.id}
            onClick={() => onRowClick && onRowClick(complaint)}
          >
            <span style={{ fontWeight: "600", color: "var(--slate-700)" }}>
              #{complaint.id}
            </span>

            <div>
              <strong style={{ display: "block", color: "var(--slate-900)" }}>
                {complaint.title}
              </strong>
              <small
                style={{
                  color: "var(--slate-500)",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {complaint.description}
              </small>
            </div>

            <span style={{ color: "var(--slate-700)" }}>
              {complaint.category || "-"}
            </span>

            <span>
              <StatusBadge status={complaint.status} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComplaintTable;
