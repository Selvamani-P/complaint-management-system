import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Icon from "../common/Icon";
import { logout } from "../../store/slices/authSlice";
import { setMobileSidebar } from "../../store/slices/uiSlice";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();
  const name = localStorage.getItem("name") || role;
  const mobileOpen = useSelector((state) => state.ui?.sidebarMobileOpen || false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const closeMobile = () => {
    dispatch(setMobileSidebar(false));
  };

  const isActive = (path) => {
    if (path === "/complaints" && location.pathname.startsWith("/complaints") && location.pathname !== "/complaints/create") {
      return true;
    }
    return location.pathname === path;
  };

  const navItem = (path, iconName, label) => (
    <button
      key={path}
      className={`menu-item ${isActive(path) ? "active" : ""}`}
      onClick={() => {
        navigate(path);
        closeMobile();
      }}
    >
      <span className="menu-icon">
        <Icon name={iconName} size={18} />
      </span>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? "mobile-open" : ""}`}
        onClick={closeMobile}
      />

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="logo-box">CMS</div>
          <div>
            <h2>Complaint</h2>
            <span>Management System</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav>
          <div className="menu-title">Main Menu</div>

          {/* Dashboard - All Roles */}
          {navItem("/dashboard", "dashboard", "Dashboard")}

          {/* Citizen Navigation */}
          {role === "CITIZEN" && (
            <>
              {navItem("/complaints", "complaints", "My Complaints")}
              {navItem("/complaints/create", "plus", "New Complaint")}
            </>
          )}

          {/* Employee Navigation */}
          {role === "EMPLOYEE" && (
            <>
              {navItem("/assigned", "check", "Assigned Tasks")}
              {navItem("/complaints", "complaints", "Complaints")}
            </>
          )}

          {/* Admin Navigation */}
          {role === "ADMIN" && (
            <>
              {navItem("/complaints", "complaints", "All Complaints")}
              {navItem("/users", "users", "Manage Users")}
              {navItem("/reports", "reports", "Reports")}
            </>
          )}

          {/* Profile - All Roles */}
          <div className="menu-title" style={{ marginTop: "20px" }}>Account</div>
          {navItem("/profile", "profile", "Profile")}
        </nav>

        {/* USER PROFILE & LOGOUT */}
        <div className="sidebar-bottom">
          <div className="user-box">
            <div className="user-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{name}</strong>
              <span>{role}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <Icon name="logout" size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
