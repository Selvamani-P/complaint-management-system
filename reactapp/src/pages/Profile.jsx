import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import userService from "../services/userService";
import { logout } from "../store/slices/authSlice";
import { addToast } from "../store/slices/uiSlice";
import { getErrorMessage } from "../services/api";

export function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    id: null,
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: "",
    role: (localStorage.getItem("role") || "CITIZEN").toUpperCase()
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        if (isMounted && data) {
          setUserProfile(data);
          if (data.name) localStorage.setItem("name", data.name);
          if (data.email) localStorage.setItem("email", data.email);
          if (data.role) localStorage.setItem("role", data.role);
        }
      } catch (err) {
        console.warn("Could not load backend profile, falling back to cached state:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEdit = () => {
    setFormData({
      name: userProfile.name || "",
      email: userProfile.email || "",
      phone: userProfile.phone || ""
    });
    setErrors({});
    setEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (formData.phone && formData.phone.trim().length > 0) {
      if (!/^[0-9+\s\-()]{7,15}$/.test(formData.phone.trim())) {
        errs.phone = "Please enter a valid phone number (7-15 digits)";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!userProfile.id) {
      dispatch(addToast({ message: "Unable to identify user record for update.", type: "error" }));
      return;
    }

    try {
      setActionLoading(true);
      const updated = await userService.updateUser(userProfile.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: userProfile.role
      });

      setUserProfile(updated);
      localStorage.setItem("name", updated.name);
      localStorage.setItem("email", updated.email);

      dispatch(addToast({ message: "Profile updated successfully!", type: "success" }));
      setEditModalOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update profile.");
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else {
        dispatch(addToast({ message: msg, type: "error" }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userProfile.id) {
      dispatch(addToast({ message: "Unable to identify user account to delete.", type: "error" }));
      return;
    }

    try {
      setActionLoading(true);
      await userService.deleteUser(userProfile.id);
      dispatch(addToast({ message: "Your account has been permanently deleted.", type: "success" }));
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to delete account."), type: "error" }));
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getRoleBadgeClass = () => {
    if (userProfile.role === "ADMIN") return "role-badge role-admin";
    if (userProfile.role === "EMPLOYEE") return "role-badge role-employee";
    return "role-badge role-citizen";
  };

  return (
    <AppLayout
      title="My Profile"
      subtitle="View and manage your personal account information and system authorization."
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
      <div className="profile-container" style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {(userProfile.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "var(--slate-900)" }}>
                {userProfile.name || "User"}
              </h2>
              <span className={getRoleBadgeClass()}>{userProfile.role}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <span>Full Name</span>
              <strong>{loading ? "Loading..." : userProfile.name || "-"}</strong>
            </div>

            <div className="profile-detail">
              <span>Email Address</span>
              <strong>{loading ? "Loading..." : userProfile.email || "-"}</strong>
            </div>

            <div className="profile-detail">
              <span>Phone Number</span>
              <strong>{loading ? "Loading..." : userProfile.phone || "Not provided"}</strong>
            </div>

            <div className="profile-detail">
              <span>System Role</span>
              <strong>{userProfile.role}</strong>
            </div>

            <div className="profile-detail">
              <span>Account Status</span>
              <strong style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px" }}>●</span> Active
              </strong>
            </div>
          </div>

          {/* ACTIONS ROW */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="primary"
                icon={<Icon name="edit" size={15} />}
                onClick={handleOpenEdit}
                disabled={loading}
              >
                Edit Profile
              </Button>

              {userProfile.role !== "ADMIN" && (
                <Button
                  variant="danger"
                  icon={<Icon name="trash" size={15} />}
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={loading}
                >
                  Delete Account
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              icon={<Icon name="logout" size={15} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Account Profile"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveProfile} noValidate>
          <div className="form-group">
            <label htmlFor="profile-name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={handleInputChange}
              disabled={actionLoading}
              required
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="e.g. jane.doe@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={actionLoading}
              required
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? "input-error" : ""}`}
              placeholder="e.g. +1 555-123-4567"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={actionLoading}
            />
            {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
          </div>

          <div
            className="form-actions"
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px"
            }}
          >
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

      {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account"
        message="Are you sure you want to delete your account? All your complaints, history, and notifications will be removed permanently. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        variant="danger"
        loading={actionLoading}
      />
    </AppLayout>
  );
}

export default Profile;