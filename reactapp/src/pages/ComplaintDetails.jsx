import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import StatusBadge from "../components/complaint/StatusBadge";
import PriorityBadge from "../components/complaint/PriorityBadge";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import Modal from "../components/common/Modal";
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
  const currentEmail = (localStorage.getItem("email") || "").toLowerCase();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    priority: "MEDIUM",
    description: ""
  });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [complaintData, historyData] = await Promise.all([
          complaintService.getComplaintById(id),
          complaintService.getComplaintHistory(id).catch((err) => {
            console.warn("Could not fetch complaint history:", err);
            return [];
          })
        ]);

        if (!isMounted) return;

        setComplaint(complaintData);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setSelectedStatus(complaintData.status || "PENDING");
        setSelectedEmployee(complaintData.assignedEmployee?.id ? String(complaintData.assignedEmployee.id) : "");

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

  const complainantEmail = (
    complaint?.complainant?.email ||
    complaint?.submitterEmail ||
    complaint?.email ||
    ""
  ).toLowerCase();
  const isOwner = Boolean(complainantEmail && currentEmail && complainantEmail === currentEmail);
  const canEdit = complaint && ((isOwner && complaint.status !== "RESOLVED" && complaint.status !== "CLOSED") || role === "ADMIN");
  const canDelete = complaint && (isOwner || role === "ADMIN");

  const openEditModal = () => {
    setEditFormData({
      title: complaint.title || "",
      category: complaint.category || "INFRASTRUCTURE",
      priority: complaint.priority || "MEDIUM",
      description: complaint.description || ""
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editFormData.title.trim()) errors.title = "Title is required";
    else if (editFormData.title.trim().length < 3) errors.title = "Title must be at least 3 characters";
    if (!editFormData.category) errors.category = "Category is required";
    if (!editFormData.description.trim()) errors.description = "Description is required";
    else if (editFormData.description.trim().length < 10) errors.description = "Description must be at least 10 characters";

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      const updated = await complaintService.updateComplaint(id, editFormData);
      setComplaint(updated);
      dispatch(addToast({ message: "Complaint updated successfully!", type: "success" }));
      setEditModalOpen(false);

      const hist = await complaintService.getComplaintHistory(id).catch(() => []);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to update complaint."), type: "error" }));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await complaintService.deleteComplaint(id);
      dispatch(addToast({ message: "Complaint deleted successfully!", type: "success" }));
      navigate("/complaints");
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to delete complaint."), type: "error" }));
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {canEdit && (
            <Button
              variant="outline"
              icon={<Icon name="edit" size={14} />}
              onClick={openEditModal}
              disabled={actionLoading}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              icon={<Icon name="trash" size={14} />}
              onClick={() => setDeleteModalOpen(true)}
              disabled={actionLoading}
            >
              Delete
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<Icon name="arrowLeft" size={15} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
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

        {/* COMPLAINT ACTIVITY TIMELINE */}
        <div className="action-section" style={{ marginTop: "24px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="clock" size={18} />
            Complaint Activity & History
          </h3>
          <p className="form-help" style={{ marginBottom: "16px" }}>
            Transparent milestone audit tracking all status updates, assignment shifts, and modifications.
          </p>

          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: "20px" }}>
              No history events recorded yet.
            </div>
          ) : (
            <div className="timeline-container">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-user">
                        {item.user?.name || item.user?.email || "System"}
                        {item.user?.role ? ` (${item.user.role})` : ""}
                      </span>
                      <span className="timeline-date">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="timeline-comment">{item.comment}</p>
                    {item.statusChangeFrom && item.statusChangeTo && (
                      <div className="timeline-transition">
                        <StatusBadge status={item.statusChangeFrom} />
                        <span className="timeline-arrow">&rarr;</span>
                        <StatusBadge status={item.statusChangeTo} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATUS UPDATE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status of Complaint #${complaint.id} to ${selectedStatus}?`}
        confirmText="Yes, Update Status"
        loading={actionLoading}
      />

      {/* DELETE COMPLAINT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Complaint"
        message={`Are you sure you want to permanently delete Complaint #${complaint.id}? All associated history and updates will be removed.`}
        confirmText="Delete Complaint"
        variant="danger"
        loading={actionLoading}
      />

      {/* EDIT COMPLAINT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Complaint #${complaint.id}`}
        maxWidth="600px"
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="edit-title">
              Complaint Subject / Title <span className="required-star">*</span>
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              className={`form-input ${editErrors.title ? "input-error" : ""}`}
              value={editFormData.title}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            />
            {editErrors.title && <span className="form-error-msg">{editErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-category">
              Category <span className="required-star">*</span>
            </label>
            <select
              id="edit-category"
              name="category"
              className={`form-select ${editErrors.category ? "input-error" : ""}`}
              value={editFormData.category}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            >
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="SERVICE">Service</option>
              <option value="PERSONNEL">Personnel</option>
              <option value="Water">Water Supply</option>
              <option value="Electricity">Electricity & Power</option>
              <option value="Road">Roads & Pathways</option>
              <option value="Sanitation">Sanitation & Drainage</option>
              <option value="Garbage">Garbage & Waste</option>
              <option value="Street Light">Street Lighting</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Other">Other Issues</option>
            </select>
            {editErrors.category && <span className="form-error-msg">{editErrors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-priority">
              Priority <span className="required-star">*</span>
            </label>
            <select
              id="edit-priority"
              name="priority"
              className="form-select"
              value={editFormData.priority}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">
              Detailed Description <span className="required-star">*</span>
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={5}
              className={`form-textarea ${editErrors.description ? "input-error" : ""}`}
              value={editFormData.description}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            />
            {editErrors.description && (
              <span className="form-error-msg">{editErrors.description}</span>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              disabled={actionLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

export default ComplaintDetails;