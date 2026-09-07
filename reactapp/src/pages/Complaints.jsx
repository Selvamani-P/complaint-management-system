import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import StatusBadge from "../components/complaint/StatusBadge";
import PriorityBadge from "../components/complaint/PriorityBadge";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import complaintService from "../services/complaintService";
import { getErrorMessage } from "../services/api";

export function Complaints() {
  const navigate = useNavigate();

  const role = (localStorage.getItem("role") || "CITIZEN").toUpperCase();
  const loggedInEmail = (localStorage.getItem("email") || "").toLowerCase().trim();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await complaintService.getAllComplaints();
        if (isMounted) {
          setComplaints(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load complaints."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter complaints based on role
  const roleComplaints = useMemo(() => {
    if (role === "ADMIN") {
      return complaints;
    }
    if (role === "CITIZEN") {
      return complaints.filter((c) => {
        const cEmail = (c.complainant?.email || c.submitterEmail || c.email || "").toLowerCase().trim();
        return cEmail === loggedInEmail;
      });
    }
    // Employee sees all or can filter
    return complaints;
  }, [complaints, role, loggedInEmail]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = roleComplaints.map((c) => c.category).filter(Boolean);
    return [...new Set(cats)];
  }, [roleComplaints]);

  // Filter, search, and sort
  const filteredComplaints = useMemo(() => {
    let list = [...roleComplaints];

    if (statusFilter !== "ALL") {
      list = list.filter(
        (c) => (c.status || "").toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (categoryFilter !== "ALL") {
      list = list.filter((c) => c.category === categoryFilter);
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

    list.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.submittedDate || 0).getTime();
      const dateB = new Date(b.submittedAt || b.submittedDate || 0).getTime();

      if (sortOrder === "NEWEST") return dateB - dateA;
      if (sortOrder === "OLDEST") return dateA - dateB;
      if (sortOrder === "TITLE_ASC") return (a.title || "").localeCompare(b.title || "");
      if (sortOrder === "TITLE_DESC") return (b.title || "").localeCompare(a.title || "");
      return 0;
    });

    return list;
  }, [roleComplaints, statusFilter, categoryFilter, search, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, search, sortOrder]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSortOrder("NEWEST");
    setCurrentPage(1);
  };

  const getPageTitle = () => {
    if (role === "CITIZEN") return "My Complaints";
    if (role === "EMPLOYEE") return "Complaints Directory";
    return "All Complaints Management";
  };

  const getPageSubtitle = () => {
    if (role === "CITIZEN") return "Track, review status updates, and view history of your complaints.";
    if (role === "EMPLOYEE") return "Browse assigned and department complaints for resolution.";
    return "Complete administrative oversight of all registered complaints.";
  };

  return (
    <AppLayout
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
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
      <div className="content-card">
        {/* FILTER BAR */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by ID, title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            data-testid="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            data-testid="status-filter"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="TITLE_ASC">Title A-Z</option>
            <option value="TITLE_DESC">Title Z-A</option>
          </select>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Reset
          </button>
        </div>

        {/* RESULTS INFO */}
        {!loading && !error && filteredComplaints.length > 0 && (
          <div className="results-info">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
          </div>
        )}

        {/* STATES */}
        {loading && <div className="empty-state">Loading complaints...</div>}

        {!loading && error && (
          <div className="error-state" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && filteredComplaints.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No complaints found</h3>
            <p>
              {role === "CITIZEN"
                ? "You haven't submitted any complaints matching this filter."
                : "No complaints found matching the selected criteria."}
            </p>
          </div>
        )}

        {/* TABLE VIEW */}
        {!loading && !error && paginatedComplaints.length > 0 && (
          <>
            <div className="table-responsive">
              <div className="complaints-table">
                <div className="table-header">
                  <span>ID</span>
                  <span>Complaint</span>
                  <span>Category</span>
                  <span>Status</span>
                </div>

                {paginatedComplaints.map((c) => (
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

export default Complaints;