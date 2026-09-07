import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import StatusBadge from "../components/complaint/StatusBadge";
import PriorityBadge from "../components/complaint/PriorityBadge";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import ConfirmDialog from "../components/common/ConfirmDialog";
import complaintService from "../services/complaintService";
import userService from "../services/userService";
import { addToast } from "../store/slices/uiSlice";
import { getErrorMessage } from "../services/api";

export function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();

  const [complaint, setComplaint] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await complaintService.getComplaintById(id);
        if (!isMounted) return;

        setComplaint(data);
        setSelectedStatus(data.status || "PENDING");
        setSelectedEmployee(data.assignedEmployee?.id ? String(data.assignedEmployee.id) : "");

        if (role === "ADMIN") {
          try {
            const empList = await userService.getEmployees();
            if (isMounted) {
              setEmployees(empList);
            }
          } catch (empErr) {
            console.warn("Could not fetch employees:", empErr);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load complaint details."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, role]);

  const handleAssign = async () => {
    if (!selectedEmployee) {
      dispatch(addToast({ message: "Please select an employee first.", type: "error" }));
      return;
    }

    try {
      setActionLoading(true);
      const updated = await complaintService.assignComplaint(id, selectedEmployee);
      setComplaint(updated);
      setSelectedStatus(updated.status || "ASSIGNED");
      dispatch(addToast({ message: "Employee assigned successfully!", type: "success" }));
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to assign employee."), type: "error" }));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusUpdate = async () => {
    setStatusModalOpen(false);
    if (!selectedStatus) return;

    try {
      setActionLoading(true);
      const updated = await complaintService.updateStatus(id, selectedStatus);
      setComplaint(updated);
      dispatch(addToast({ message: `Status updated to ${selectedStatus}!`, type: "success" }));
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to update status."), type: "error" }));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Complaint Details">
        <div className="content-card">
          <div className="empty-state">Loading complaint information...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !complaint) {
    return (
      <AppLayout title="Complaint Details">
        <div className="content-card">
          <div className="error-state" role="alert">
            {error || "Complaint not found."}
          </div>
          <Button variant="secondary" onClick={() => navigate("/complaints")}>
            ← Back to Complaints
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Complaint #${complaint.id}`}
      subtitle={`Submitted on ${
        complaint.submittedAt || complaint.submittedDate
          ? new Date(complaint.submittedAt || complaint.submittedDate).toLocaleString()
          : "N/A"
      }`}
      rightAction={
        <Button
          variant="secondary"
          icon={<Icon name="arrowLeft" size={15} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      }
    >
      <div className="content-card">
        {/* COMPLAINT HEADER */}
        <div className="complaint-details-header">
          <div>
            <span className="complaint-id">#{complaint.id} &bull; {complaint.category || "General"}</span>
            <h2 style={{ fontSize: "20px", margin: "6px 0" }}>{complaint.title}</h2>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {complaint.priority && <PriorityBadge priority={complaint.priority} />}
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="profile-details">
          <div className="profile-detail">
            <span>Complainant</span>
            <strong>{complaint.complainant?.name || complaint.submittedBy || "Anonymous"}</strong>
          </div>

          <div className="profile-detail">
            <span>Complainant Email</span>
            <strong>{complaint.complainant?.email || complaint.submitterEmail || complaint.email || "-"}</strong>
          </div>

          <div className="profile-detail">
            <span>Assigned Staff</span>
            <strong>{complaint.assignedEmployee?.name || complaint.assignedTo || "Unassigned"}</strong>
          </div>

          <div className="profile-detail">
            <span>Staff Contact</span>
            <strong>{complaint.assignedEmployee?.email || "-"}</strong>
          </div>

          <div className="profile-detail">
            <span>Submitted At</span>
            <strong>
              {complaint.submittedAt || complaint.submittedDate
                ? new Date(complaint.submittedAt || complaint.submittedDate).toLocaleString()
                : "-"}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Resolved At</span>
            <strong>
              {complaint.resolvedAt || complaint.resolvedDate
                ? new Date(complaint.resolvedAt || complaint.resolvedDate).toLocaleString()
                : "In Progress"}
            </strong>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="complaint-description">
          <h3>Complaint Description</h3>
          <p>{complaint.description}</p>
        </div>

        {/* ADMIN EMPLOYEE ASSIGNMENT */}
        {role === "ADMIN" && (
          <div className="action-section">
            <h3>Staff Assignment</h3>
            <p className="form-help" style={{ marginBottom: "12px" }}>
              Assign or reassign this ticket to a qualified staff member for resolution.
            </p>
            <div className="action-row">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="form-select"
                disabled={actionLoading}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                onClick={handleAssign}
                loading={actionLoading}
                disabled={actionLoading || !selectedEmployee}
              >
                {complaint.assignedEmployee ? "Reassign" : "Assign"}
              </Button>
            </div>
            {employees.length === 0 && (
              <p className="form-help" style={{ color: "#d97706", marginTop: "8px" }}>
                No employees registered in the system yet.
              </p>
            )}
          </div>
        )}

        {/* EMPLOYEE / ADMIN STATUS UPDATE */}
        {(role === "ADMIN" || role === "EMPLOYEE") && (
          <div className="action-section">
            <h3>Workflow Status Progression</h3>
            <p className="form-help" style={{ marginBottom: "12px" }}>
              Update complaint progression milestone.
            </p>
            <div className="action-row">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                disabled={actionLoading}
              >
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <Button
                variant="primary"
                onClick={() => setStatusModalOpen(true)}
                loading={actionLoading}
                disabled={actionLoading || selectedStatus === complaint.status}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status of Complaint #${complaint.id} to ${selectedStatus}?`}
        confirmText="Yes, Update Status"
        loading={actionLoading}
      />
    </AppLayout>
  );
}

export default ComplaintDetails;