import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import StatusBadge from "../components/complaint/StatusBadge";
import PriorityBadge from "../components/complaint/PriorityBadge";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import complaintService from "../services/complaintService";
import { getErrorMessage } from "../services/api";

export function AssignedTasks() {
  const navigate = useNavigate();
  const email = (localStorage.getItem("email") || "").toLowerCase().trim();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("ALL"); // ALL, PENDING, IN_PROGRESS, RESOLVED
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const allComplaints = await complaintService.getAllComplaints();
        if (!isMounted) return;

        const assigned = allComplaints.filter((c) => {
          const empEmail = (c.assignedEmployee?.email || c.assignedTo || "").toLowerCase().trim();
          return empEmail === email;
        });

        setComplaints(assigned);
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load assigned tasks."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [email]);

  const filteredTasks = useMemo(() => {
    let list = [...complaints];

    if (activeTab !== "ALL") {
      if (activeTab === "PENDING") {
        list = list.filter((c) => (c.status || "").toUpperCase() === "PENDING" || (c.status || "").toUpperCase() === "ASSIGNED");
      } else if (activeTab === "IN_PROGRESS") {
        list = list.filter((c) => (c.status || "").toUpperCase().includes("PROGRESS"));
      } else if (activeTab === "RESOLVED") {
        list = list.filter((c) => (c.status || "").toUpperCase() === "RESOLVED");
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const cat = (c.category || "").toLowerCase();
        const id = String(c.id || "");
        return title.includes(q) || desc.includes(q) || cat.includes(q) || id.includes(q);
      });
    }

    return list;
  }, [complaints, activeTab, search]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = complaints.filter(
    (c) => (c.status || "").toUpperCase() === "PENDING" || (c.status || "").toUpperCase() === "ASSIGNED"
  ).length;

  const inProgressCount = complaints.filter(
    (c) => (c.status || "").toUpperCase().includes("PROGRESS")
  ).length;

  const resolvedCount = complaints.filter(
    (c) => (c.status || "").toUpperCase() === "RESOLVED"
  ).length;

  return (
    <AppLayout
      title="My Assigned Tasks"
      subtitle="Complaints assigned to your resolution queue. Review, investigate, and mark progress."
      rightAction={
        <Button
          variant="secondary"
          icon={<Icon name="complaints" size={15} />}
          onClick={() => navigate("/complaints")}
        >
          Browse All
        </Button>
      }
    >
      {/* TABS & METRIC FILTER */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`pagination-number ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => { setActiveTab("ALL"); setCurrentPage(1); }}
          style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}
        >
          All Assigned ({complaints.length})
        </button>

        <button
          type="button"
          className={`pagination-number ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => { setActiveTab("PENDING"); setCurrentPage(1); }}
          style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}
        >
          Needs Action ({pendingCount})
        </button>

        <button
          type="button"
          className={`pagination-number ${activeTab === "IN_PROGRESS" ? "active" : ""}`}
          onClick={() => { setActiveTab("IN_PROGRESS"); setCurrentPage(1); }}
          style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}
        >
          In Progress ({inProgressCount})
        </button>

        <button
          type="button"
          className={`pagination-number ${activeTab === "RESOLVED" ? "active" : ""}`}
          onClick={() => { setActiveTab("RESOLVED"); setCurrentPage(1); }}
          style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}
        >
          Completed ({resolvedCount})
        </button>
      </div>

      <div className="content-card">
        {/* SEARCH BAR */}
        <div className="filter-bar" style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search your assigned complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && <div className="empty-state">Loading assigned queue...</div>}

        {!loading && error && (
          <div className="error-state" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No assigned complaints found</h3>
            <p>
              {complaints.length === 0
                ? "You have no complaints assigned to you yet."
                : "No complaints found in this category filter."}
            </p>
          </div>
        )}

        {!loading && !error && filteredTasks.length > 0 && (
          <>
            <div className="table-responsive">
              <div className="complaints-table">
                <div className="table-header">
                  <span>ID</span>
                  <span>Complaint</span>
                  <span>Category</span>
                  <span>Status</span>
                </div>

                {paginatedTasks.map((c) => (
                  <div
                    className="table-row"
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <span style={{ fontWeight: "600", color: "var(--primary-600)" }}>
                      #{c.id}
                    </span>

                    <div>
                      <strong style={{ color: "var(--slate-900)" }}>{c.title}</strong>
                      <small
                        style={{
                          color: "var(--slate-500)",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {c.description}
                      </small>
                    </div>

                    <span style={{ color: "var(--slate-700)" }}>
                      {c.category || "-"}
                    </span>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {c.priority && <PriorityBadge priority={c.priority} />}
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default AssignedTasks;