import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import complaintService from "../services/complaintService";
import { addToast } from "../store/slices/uiSlice";
import { getErrorMessage } from "../services/api";

export function ComplaintFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: ""
  });

  const [clientErrors, setClientErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Please enter a complaint title.";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }

    if (!formData.category) {
      errors.category = "Please select an applicable category.";
    }

    if (!formData.description.trim()) {
      errors.description = "Please describe the problem in detail.";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const email = localStorage.getItem("email");
    if (!email) {
      setServerError("User session not found. Please log in again.");
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await complaintService.createComplaint({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        email: email
      });

      dispatch(addToast({ message: "Complaint submitted successfully!", type: "success" }));
      navigate("/complaints");
    } catch (err) {
      setServerError(getErrorMessage(err, "Failed to submit complaint. Please check your details."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Submit New Complaint"
      subtitle="Provide clear details to help us investigate and resolve the issue quickly."
      rightAction={
        <Button
          variant="secondary"
          icon={<Icon name="arrowLeft" size={15} />}
          onClick={() => navigate("/complaints")}
        >
          Cancel
        </Button>
      }
    >
      <div className="form-card">
        {serverError && (
          <div className="error-state" role="alert" style={{ marginBottom: "20px" }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* TITLE */}
          <div className="form-group">
            <label htmlFor="complaint-title">
              Complaint Subject / Title <span className="required-star">*</span>
            </label>
            <input
              id="complaint-title"
              name="title"
              type="text"
              className={`form-input ${clientErrors.title ? "input-error" : ""}`}
              placeholder="e.g. Street light malfunctioning near block B"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {clientErrors.title && (
              <span className="form-error-msg">{clientErrors.title}</span>
            )}
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label htmlFor="complaint-category">
              Category <span className="required-star">*</span>
            </label>
            <select
              id="complaint-category"
              name="category"
              className={`form-select ${clientErrors.category ? "input-error" : ""}`}
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">-- Choose Category --</option>
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
            {clientErrors.category && (
              <span className="form-error-msg">{clientErrors.category}</span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label htmlFor="complaint-description">
              Detailed Description <span className="required-star">*</span>
            </label>
            <textarea
              id="complaint-description"
              name="description"
              rows={6}
              className={`form-textarea ${clientErrors.description ? "input-error" : ""}`}
              placeholder="Provide exact location, timeline, and any relevant details to expedite resolution..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {clientErrors.description && (
              <span className="form-error-msg">{clientErrors.description}</span>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/complaints")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default ComplaintFormPage;