import React, { useState } from "react";
import axios from "axios";

export function ComplaintForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title must be provided";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description must be provided";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category must be selected";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name must be provided";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email must be provided";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Email must be valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setApiError("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/complaints", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        name: formData.name.trim(),
        email: formData.email.trim()
      });

      setSuccessMessage("Complaint submitted successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || ""
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Backend error! Could not submit complaint.";
      setApiError(typeof msg === "string" ? msg : "Backend error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit} noValidate>
        {successMessage && (
          <div className="success-state" role="status">
            {successMessage}
          </div>
        )}

        {apiError && (
          <div className="error-state" role="alert">
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required-star">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter complaint title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            className={`form-input ${errors.title ? "input-error" : ""}`}
          />
          {errors.title && <span className="form-error-msg">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required-star">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
            className={`form-select ${errors.category ? "input-error" : ""}`}
          >
            <option value="">Select a category</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="SERVICE">Service</option>
            <option value="PERSONNEL">Personnel</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Road">Road</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="form-error-msg">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required-star">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="Provide detailed information regarding the complaint..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            className={`form-textarea ${errors.description ? "input-error" : ""}`}
          />
          {errors.description && (
            <span className="form-error-msg">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required-star">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className={`form-input ${errors.name ? "input-error" : ""}`}
          />
          {errors.name && <span className="form-error-msg">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required-star">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={`form-input ${errors.email ? "input-error" : ""}`}
          />
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplaintForm;
