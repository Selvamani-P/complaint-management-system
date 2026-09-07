import React, { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/StatCard";
import Icon from "../components/common/Icon";
import reportService from "../services/reportService";
import complaintService from "../services/complaintService";
import { getErrorMessage } from "../services/api";

export function Reports() {
  const [complaints, setComplaints] = useState([]);
  const [summaryReport, setSummaryReport] = useState({});
  const [statusReport, setStatusReport] = useState({});
  const [employeeReport, setEmployeeReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const complaintsData = await complaintService.getAllComplaints();
        if (!isMounted) return;
        setComplaints(complaintsData);

        // Fetch backend reports
        try {
          const [summary, status, emp] = await Promise.all([
            reportService.getSummary(),
            reportService.getStatusReport(),
            reportService.getEmployeeReport()
          ]);
          if (isMounted) {
            setSummaryReport(summary || {});
            setStatusReport(status || {});
            setEmployeeReport(emp || {});
          }
        } catch (repErr) {
          console.warn("Backend report endpoints partial failure, calculating locally:", repErr);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load reports."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = summaryReport.total !== undefined ? summaryReport.total : complaints.length;
  const pending =
    statusReport.PENDING !== undefined
      ? statusReport.PENDING
      : complaints.filter((c) => (c.status || "").toUpperCase() === "PENDING").length;

  const inProgress =
    statusReport.IN_PROGRESS !== undefined
      ? statusReport.IN_PROGRESS
      : complaints.filter((c) => (c.status || "").toUpperCase().includes("PROGRESS")).length;

  const resolved =
    statusReport.RESOLVED !== undefined
      ? statusReport.RESOLVED
      : complaints.filter((c) => (c.status || "").toUpperCase() === "RESOLVED").length;

  const assigned = complaints.filter((c) => c.assignedEmployee || c.assignedTo).length;
  const unassigned = Math.max(0, total - assigned);

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category distribution
  const categoryCounts = complaints.reduce((acc, c) => {
    const cat = c.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout
      title="Analytics & Reports"
      subtitle="Operational performance metrics, resolution rates, and department distributions."
    >
      {error && (
        <div className="error-state" role="alert" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* METRIC OVERVIEW */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered"
          value={loading ? "..." : total}
          description="Lifetime complaints filed"
          icon={<Icon name="complaints" size={20} />}
        />
        <StatCard
          title="Pending Action"
          value={loading ? "..." : pending}
          description="Awaiting assignment/review"
          icon={<Icon name="clock" size={20} />}
        />
        <StatCard
          title="In Progress"
          value={loading ? "..." : inProgress}
          description="Under active investigation"
          icon={<Icon name="info" size={20} />}
        />
        <StatCard
          title="Resolved"
          value={loading ? "..." : resolved}
          description="Completed resolution tickets"
          icon={<Icon name="check" size={20} />}
          trend={`${resolutionRate}% rate`}
        />
      </div>

      <div className="dashboard-grid">
        {/* COMPLAINT STATUS SUMMARY */}
        <div className="content-card" style={{ margin: 0 }}>
          <h2>Status Distribution</h2>
          <p className="card-subtitle" style={{ marginBottom: "16px" }}>
            Current breakdown across all lifecycle stages
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "var(--slate-700)" }}>Resolved</span>
                <strong style={{ color: "#065f46" }}>{resolved} ({total > 0 ? Math.round((resolved / total) * 100) : 0}%)</strong>
              </div>
              <div style={{ height: "8px", background: "var(--slate-200)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${total > 0 ? (resolved / total) * 100 : 0}%`,
                    background: "#10b981",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "var(--slate-700)" }}>In Progress</span>
                <strong style={{ color: "#075985" }}>{inProgress} ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</strong>
              </div>
              <div style={{ height: "8px", background: "var(--slate-200)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${total > 0 ? (inProgress / total) * 100 : 0}%`,
                    background: "#0ea5e9",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "var(--slate-700)" }}>Pending</span>
                <strong style={{ color: "#92400e" }}>{pending} ({total > 0 ? Math.round((pending / total) * 100) : 0}%)</strong>
              </div>
              <div style={{ height: "8px", background: "var(--slate-200)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${total > 0 ? (pending / total) * 100 : 0}%`,
                    background: "#f59e0b",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ fontWeight: "600", color: "var(--slate-700)" }}>Unassigned Tickets</span>
                <strong style={{ color: "var(--slate-700)" }}>{unassigned}</strong>
              </div>
              <div style={{ height: "8px", background: "var(--slate-200)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${total > 0 ? (unassigned / total) * 100 : 0}%`,
                    background: "#94a3b8",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION & STAFF REPORT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="content-card" style={{ margin: 0 }}>
            <h2>Category Distribution</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              {Object.keys(categoryCounts).length === 0 ? (
                <div style={{ color: "var(--slate-400)", fontSize: "13px" }}>No categories available</div>
              ) : (
                Object.entries(categoryCounts).map(([cat, count]) => (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--slate-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      fontSize: "13px"
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "var(--slate-800)" }}>{cat}</span>
                    <strong style={{ color: "var(--primary-700)" }}>{count}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STAFF METRIC */}
          {Object.keys(employeeReport).length > 0 && (
            <div className="content-card" style={{ margin: 0 }}>
              <h2>Staff Workload Distribution</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                {Object.entries(employeeReport).map(([emp, count]) => (
                  <div
                    key={emp}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid var(--border-color)",
                      fontSize: "13px"
                    }}
                  >
                    <span>{emp}</span>
                    <strong>{count} tickets</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Reports;