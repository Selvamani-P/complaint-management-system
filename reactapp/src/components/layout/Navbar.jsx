import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import { toggleMobileSidebar } from "../../store/slices/uiSlice";
import { logout } from "../../store/slices/authSlice";
import { markNotificationAsRead } from "../../store/slices/notificationSlice";

export function Navbar({ title, subtitle, rightAction }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();
  const name = localStorage.getItem("name") || role;
  const notifications = useSelector((state) => state.notifications?.items || []);
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      dispatch(markNotificationAsRead(n.id));
    }
  };

  const getRoleBadgeClass = () => {
    if (role === "ADMIN") return "role-badge role-admin";
    if (role === "EMPLOYEE") return "role-badge role-employee";
    return "role-badge role-citizen";
  };

  const notificationDropdown = showNotifications && (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "100%",
        marginTop: "8px",
        width: "300px",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-color)",
        zIndex: 150,
        overflow: "hidden"
      }}
      role="region"
      aria-label="Notifications Panel"
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border-color)",
          fontWeight: "600",
          fontSize: "13px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span style={{ color: "var(--primary-600)", fontSize: "11px", fontWeight: "700" }}>
            {unreadCount} new
          </span>
        )}
      </div>
      <div style={{ maxHeight: "240px", overflowY: "auto", padding: "4px 0" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--slate-400)", fontSize: "12px" }}>
            No notifications available
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: "10px 14px",
                fontSize: "12.5px",
                borderBottom: "1px solid var(--slate-100)",
                backgroundColor: n.isRead ? "transparent" : "var(--primary-50)",
                cursor: "pointer",
                transition: "background 150ms ease"
              }}
            >
              <div style={{ color: "var(--slate-800)", fontWeight: n.isRead ? "400" : "600" }}>
                {n.message}
              </div>
              {(n.createdAt || n.sentAt || n.date) && (
                <small style={{ display: "block", color: "var(--slate-400)", fontSize: "10.5px", marginTop: "3px" }}>
                  {new Date(n.createdAt || n.sentAt || n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </small>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => dispatch(toggleMobileSidebar())}
            style={{
              background: "none",
              border: "none",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
            aria-label="Toggle navigation menu"
          >
            <Icon name="menu" size={22} color="var(--slate-700)" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div className="logo-box" style={{ width: "28px", height: "28px", fontSize: "11px" }}>
              CMS
            </div>
            <strong style={{ fontSize: "14px", color: "var(--slate-900)" }}>CMS</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "none",
                border: "none",
                padding: "6px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                color: "var(--slate-700)"
              }}
              aria-label="Notifications"
            >
              <Icon name="bell" size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    background: "#e11d48",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: "700",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationDropdown}
          </div>

          <span className={getRoleBadgeClass()}>{role}</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#e11d48",
              padding: "6px",
              cursor: "pointer",
              display: "flex"
            }}
            aria-label="Logout"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>

      {/* Main Topbar */}
      <div className="topbar">
        <div>
          {title && <h1 className="welcome-title">{title}</h1>}
          {subtitle && <p className="welcome-text">{subtitle}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {rightAction}

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: "relative",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "var(--slate-600)"
              }}
              aria-label="Notifications"
            >
              <Icon name="bell" size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#e11d48",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "700",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationDropdown}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--slate-800)" }}>{name}</span>
            <span className={getRoleBadgeClass()}>{role}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
