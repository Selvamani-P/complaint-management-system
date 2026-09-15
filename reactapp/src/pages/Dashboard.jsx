import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/complaint/StatusBadge";
import Icon from "../components/common/Icon";
import Button from "../components/common/Button";
import complaintService from "../services/complaintService";
import userService from "../services/userService";
import notificationService from "../services/notificationService";
import { getErrorMessage } from "../services/api";

export function Dashboard() {
  const navigate = useNavigate();

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();
  const email = (localStorage.getItem("email") || "").toLowerCase().trim();
  const name = localStorage.getItem("name") || "User";

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userCounts, setUserCounts] = useState({ totalUsers: 0, employees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const complaintsData = await complaintService.getAllComplaints();
        if (!isMounted) return;
        setComplaints(complaintsData);

        if (role === "ADMIN") {
          try {
            const allUsers = await userService.getAllUsers();
            const employees = await userService.getEmployees();
            if (isMounted) {
              setUserCounts({
                totalUsers: allUsers.length,
                employees: employees.length
              });
            }
          } catch (userErr) {
            console.warn("Could not fetch user counts for admin:", userErr);
          }
        } else if (role === "CITIZEN") {
          try {
            const notifs = await notificationService.getMyNotifications();
            if (isMounted) {
              setNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
            }
          } catch (notifErr) {
            console.warn("Could not fetch citizen notifications:", notifErr);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load dashboard data."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [role]);

  // Filter complaints based on role
  let visibleComplaints = complaints;
  if (role === "CITIZEN") {
    visibleComplaints = complaints.filter((c) => {
      const cEmail = (c.complainant?.email || c.submitterEmail || c.email || "").toLowerCase().trim();
      return cEmail === email;
    });
  } else if (role === "EMPLOYEE") {
    visibleComplaints = complaints.filter((c) => {
      const empEmail = (c.assignedEmployee?.email || c.assignedTo || "").toLowerCase().trim();
      return empEmail === email;
    });
  }

  // Calculate metrics
  const total = visibleComplaints.length;
  const pending = visibleComplaints.filter((c) => (c.status || "").toUpperCase() === "PENDING").length;
  const assigned = visibleComplaints.filter((c) => (c.status || "").toUpperCase() === "ASSIGNED").length;
  const inProgress = visibleComplaints.filter(
    (c) => (c.status || "").toUpperCase() === "IN_PROGRESS" || (c.status || "").toUpperCase() === "IN PROGRESS"
  ).length;
  const resolved = visibleComplaints.filter((c) => (c.status || "").toUpperCase() === "RESOLVED").length;
  const closed = visibleComplaints.filter((c) => (c.status || "").toUpperCase() === "CLOSED").length;

  const recentComplaints = [...visibleComplaints]
    .sort((a, b) => new Date(b.submittedAt || b.submittedDate || 0) - new Date(a.submittedAt || a.submittedDate || 0))
    .slice(0, 5);

  const highPriority = visibleComplaints.filter(
    (c) => (c.priority || "").toUpperCase() === "HIGH" || (c.priority || "").toUpperCase() === "CRITICAL"
  ).length;

  const getRoleContent = () => {
    if (role === "ADMIN") {
      return {
        title: "Admin Operations Dashboard",
        subtitle: `Welcome back, ${name}. Monitor platform complaints, users, and resolution performance.`,
        stats: [
          { title: "Total Complaints", value: complaints.length, description: "System-wide complaints", icon: <Icon name="complaints" size={20} />, actionLabel: "View all →", onAction: () => navigate("/complaints") },
          { title: "Pending", value: complaints.filter(c => (c.status || "").toUpperCase() === "PENDING").length, description: "Awaiting assignment", icon: <Icon name="clock" size={20} /> },
          { title: "In Progress", value: complaints.filter(c => (c.status || "").toUpperCase().includes("PROGRESS")).length, description: "Currently being resolved", icon: <Icon name="info" size={20} /> },
          { title: "Resolved", value: complaints.filter(c => (c.status || "").toUpperCase() === "RESOLVED").length, description: "Successfully resolved", icon: <Icon name="check" size={20} /> },
          { title: "Closed", value: complaints.filter(c => (c.status || "").toUpperCase() === "CLOSED").length, description: "Archived / closed", icon: <Icon name="check" size={20} /> },
          { title: "Total Users", value: userCounts.totalUsers || "-", description: "Registered system accounts", icon: <Icon name="users" size={20} />, actionLabel: "Manage →", onAction: () => navigate("/users") }
        ]
      };
    }

    if (role === "EMPLOYEE") {
      return {
        title: "Staff Resolution Portal",
        subtitle: `Welcome back, ${name}. Track and resolve complaints assigned to your queue.`,
        stats: [
          { title: "Assigned to Me", value: total, description: "Total assigned queue", icon: <Icon name="complaints" size={20} />, actionLabel: "View queue →", onAction: () => navigate("/assigned") },
          { title: "High Priority", value: highPriority, description: "Requires urgent focus", icon: <Icon name="alert" size={20} /> },
          { title: "In Progress", value: inProgress, description: "Currently working on", icon: <Icon name="info" size={20} /> },
          { title: "Resolved", value: resolved, description: "Completed cases", icon: <Icon name="check" size={20} /> },
          { title: "Closed", value: closed, description: "Finalized complaints", icon: <Icon name="check" size={20} /> }
        ]
      };
    }

    return {
      title: "Citizen Helpdesk Dashboard",
      subtitle: `Welcome back, ${name}. Submit issues, track real-time resolution status, and view history.`,
      stats: [
        { title: "Total Filed", value: total, description: "Complaints filed by you", icon: <Icon name="complaints" size={20} />, actionLabel: "View all →", onAction: () => navigate("/complaints") },
        { title: "Pending", value: pending, description: "Awaiting official review", icon: <Icon name="clock" size={20} /> },
        { title: "In Progress", value: inProgress + assigned, description: "Staff currently working", icon: <Icon name="info" size={20} /> },
        { title: "Resolved", value: resolved, description: "Successfully completed", icon: <Icon name="check" size={20} /> },
        { title: "Closed", value: closed, description: "Archived / closed complaints", icon: <Icon name="check" size={20} /> }
      ]
    };
  };

  const content = getRoleContent();

  return (
    <AppLayout
      title={content.title}
      subtitle={content.subtitle}
      rightAction={
        role === "CITIZEN" && (
          <Button
            variant="primary"
            icon={<Icon name="plus" size={16} />}
            onClick={() => navigate("/complaints/create")}
          >
            New Complaint
          </Button>
        )
      }
    >
      {error && (
        <div className="error-state" role="alert">
          {error}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="stats-grid">
        {content.stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={loading ? "..." : stat.value}
            description={stat.description}
            icon={stat.icon}
            actionLabel={stat.actionLabel}
            onAction={stat.onAction}
          />
        ))}
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: RECENT COMPLAINTS & NOTIFICATIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* RECENT COMPLAINTS CARD */}
          <div className="content-card" style={{ margin: 0 }}>
            <div className="card-header-row">
              <div>
                <h2>Recent Complaints</h2>
                <p className="card-subtitle">
                  {role === "CITIZEN"
                    ? "Latest activity on your submitted issues"
                    : role === "EMPLOYEE"
                    ? "Recently assigned work tickets"
                    : "Latest complaints submitted to the system"}
                </p>
              </div>
              <Button
                variant="text"
                onClick={() => navigate(role === "EMPLOYEE" ? "/assigned" : "/complaints")}
              >
                View All →
              </Button>
            </div>

            {loading ? (
              <div className="empty-state">Loading recent records...</div>
            ) : recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>No complaints to display</h3>
                <p>
                  {role === "CITIZEN"
                    ? "You haven't filed any complaints yet."
                    : role === "EMPLOYEE"
                    ? "You currently have no complaints assigned."
                    : "No complaints found in the database."}
                </p>
                {role === "CITIZEN" && (
                  <div style={{ marginTop: "14px" }}>
                    <Button variant="primary" onClick={() => navigate("/complaints/create")}>
                      Submit a Complaint
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="complaint-row"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <div>
                      <div className="complaint-title">{c.title}</div>
                      <div className="complaint-meta">
                        Complaint #{c.id} &bull; {c.category || "General"}
                        {(c.submittedAt || c.submittedDate) && (
                          <span> &bull; {new Date(c.submittedAt || c.submittedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CITIZEN RECENT NOTIFICATIONS CARD */}
          {role === "CITIZEN" && (
            <div className="content-card" style={{ margin: 0 }}>
              <div className="card-header-row">
                <div>
                  <h2>Recent Notifications</h2>
                  <p className="card-subtitle">Latest status changes and updates regarding your complaints</p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: "24px" }}>
                  <p>No notifications yet. You will be alerted when your complaints are updated.</p>
                </div>
              ) : (
                <div>
                  {notifications.map((n) => {
                    const isUnread = !n.isRead && !n.read;
                    return (
                      <div
                        key={n.id}
                        style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid var(--border-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: isUnread ? "var(--primary-50)" : "transparent",
                          cursor: n.complaint?.id ? "pointer" : "default",
                          borderRadius: "var(--radius-sm)",
                          transition: "background 150ms ease"
                        }}
                        onClick={() => {
                          if (n.complaint?.id) navigate(`/complaints/${n.complaint.id}`);
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: isUnread ? "600" : "500", color: "var(--slate-800)" }}>
                            {n.message}
                          </div>
                          {(n.createdAt || n.sentAt || n.date) && (
                            <small style={{ color: "var(--slate-400)", fontSize: "11px" }}>
                              {new Date(n.createdAt || n.sentAt || n.date).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </small>
                          )}
                        </div>
                        {isUnread && (
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--primary-600)", background: "var(--primary-100)", padding: "2px 8px", borderRadius: "10px" }}>
                            New
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDE PANELS: QUICK ACTIONS, STATUS BREAKDOWN, & PRIORITY BREAKDOWN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* QUICK ACTIONS */}
          <div className="content-card" style={{ margin: 0 }}>
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {role === "CITIZEN" && (
                <>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/complaints/create")}
                  >
                    <Icon name="plus" size={18} color="var(--primary-600)" />
                    <span>File New Issue</span>
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/complaints")}
                  >
                    <Icon name="complaints" size={18} color="var(--primary-600)" />
                    <span>My Complaints</span>
                  </button>
                </>
              )}

              {role === "EMPLOYEE" && (
                <>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/assigned")}
                  >
                    <Icon name="check" size={18} color="var(--primary-600)" />
                    <span>Assigned Tasks</span>
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/complaints")}
                  >
                    <Icon name="complaints" size={18} color="var(--primary-600)" />
                    <span>All Complaints</span>
                  </button>
                </>
              )}

              {role === "ADMIN" && (
                <>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/complaints")}
                  >
                    <Icon name="complaints" size={18} color="var(--primary-600)" />
                    <span>Manage All</span>
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/users")}
                  >
                    <Icon name="users" size={18} color="var(--primary-600)" />
                    <span>Manage Users</span>
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => navigate("/reports")}
                  >
                    <Icon name="reports" size={18} color="var(--primary-600)" />
                    <span>Analytics</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* STATUS SUMMARY */}
          {!loading && (
            <div className="content-card" style={{ margin: 0 }}>
              <h2>Status Breakdown</h2>
              <div className="status-summary">
                <div className="status-summary-item">
                  <span>Pending</span>
                  <strong>{pending}</strong>
                </div>
                <div className="status-summary-item">
                  <span>Assigned</span>
                  <strong>{assigned}</strong>
                </div>
                <div className="status-summary-item">
                  <span>In Progress</span>
                  <strong>{inProgress}</strong>
                </div>
                <div className="status-summary-item">
                  <span>Resolved</span>
                  <strong>{resolved}</strong>
                </div>
                <div className="status-summary-item">
                  <span>Closed</span>
                  <strong>{closed}</strong>
                </div>
              </div>
            </div>
          )}

          {/* PRIORITY BREAKDOWN */}
          {!loading && (
            <div className="content-card" style={{ margin: 0 }}>
              <h2>Priority Breakdown</h2>
              <div className="status-summary">
                <div className="status-summary-item">
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>
                    High
                  </span>
                  <strong>{visibleComplaints.filter((c) => (c.priority || "").toUpperCase() === "HIGH").length}</strong>
                </div>
                <div className="status-summary-item">
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
                    Medium
                  </span>
                  <strong>{visibleComplaints.filter((c) => (c.priority || "").toUpperCase() === "MEDIUM").length}</strong>
                </div>
                <div className="status-summary-item">
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                    Low
                  </span>
                  <strong>{visibleComplaints.filter((c) => (c.priority || "").toUpperCase() === "LOW").length}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;