import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import { logout } from "../store/slices/authSlice";

export function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();
  const email = localStorage.getItem("email") || "Not available";
  const name = localStorage.getItem("name") || role;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getRoleBadgeClass = () => {
    if (role === "ADMIN") return "role-badge role-admin";
    if (role === "EMPLOYEE") return "role-badge role-employee";
    return "role-badge role-citizen";
  };

  return (
    <AppLayout
      title="My Profile"
      subtitle="View your authenticated account credentials and system authorization role."
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
      <div className="profile-container" style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", margin: "0 0 6px 0", color: "var(--slate-900)" }}>{name}</h2>
              <span className={getRoleBadgeClass()}>{role}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <span>Full Name</span>
              <strong>{name}</strong>
            </div>

            <div className="profile-detail">
              <span>Email Address</span>
              <strong>{email}</strong>
            </div>

            <div className="profile-detail">
              <span>System Role</span>
              <strong>{role}</strong>
            </div>

            <div className="profile-detail">
              <span>Account Status</span>
              <strong style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px" }}>●</span> Active
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="danger"
              icon={<Icon name="logout" size={15} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Profile;