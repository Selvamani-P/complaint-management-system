import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StatusBadge from "./complaint/StatusBadge";
import PriorityBadge from "./complaint/PriorityBadge";

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`/complaints/${id}`);
        if (isMounted) {
          setComplaint(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Complaint not found!");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBack = () => {
    navigate("/complaints");
  };

  if (loading) {
    return <div className="empty-state">Loading complaint details...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="content-card">
        <div className="error-state">
          {error || "Complaint not found"}
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={handleBack}
        >
          Back to List
        </button>
      </div>
    );
  }

  const assignedToName =
    complaint.assignedTo ||
    complaint.assignedEmployee?.name ||
    "Not Assigned";

  const resolvedDateValue =
    complaint.resolvedDate ||
    complaint.resolvedAt;

  const submittedDateValue =
    complaint.submittedDate ||
    complaint.submittedAt;

  return (
    <div className="content-card">
      <div className="complaint-details-header">
        <div>
          <span className="complaint-id">Complaint #{complaint.id}</span>
          <h2>{complaint.title}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {complaint.priority && <PriorityBadge priority={complaint.priority} />}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-detail">
          <span>Category</span>
          <strong>{complaint.category || "GENERAL"}</strong>
        </div>

        <div className="profile-detail">
          <span>Assigned To</span>
          <strong>{assignedToName}</strong>
        </div>

        {submittedDateValue && (
          <div className="profile-detail">
            <span>Submitted Date</span>
            <strong>{new Date(submittedDateValue).toLocaleString()}</strong>
          </div>
        )}

        {resolvedDateValue && (
          <div className="profile-detail">
            <span>Resolved Date</span>
            <strong>{new Date(resolvedDateValue).toLocaleString()}</strong>
          </div>
        )}

        {(complaint.submittedBy || complaint.complainant?.name) && (
          <div className="profile-detail">
            <span>Submitted By</span>
            <strong>{complaint.submittedBy || complaint.complainant?.name}</strong>
          </div>
        )}

        {(complaint.submitterEmail || complaint.complainant?.email) && (
          <div className="profile-detail">
            <span>Submitter Email</span>
            <strong>{complaint.submitterEmail || complaint.complainant?.email}</strong>
          </div>
        )}
      </div>

      <div className="complaint-description">
        <h3>Description</h3>
        <p>{complaint.description}</p>
      </div>

      {complaint.resolutionComments && (
        <div className="complaint-description" style={{ background: "var(--primary-50)" }}>
          <h3>Resolution Comments</h3>
          <p>{complaint.resolutionComments}</p>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <button
          type="button"
          className="secondary-button"
          onClick={handleBack}
        >
          Back to List
        </button>
      </div>
    </div>
  );
}

export default ComplaintDetail;
