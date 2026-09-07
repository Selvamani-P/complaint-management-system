import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatusBadge from "./complaint/StatusBadge";
import ComplaintFilters from "./complaint/ComplaintFilters";

export function ComplaintList({ onSelectComplaint }) {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchComplaints = async (status = "ALL") => {
    try {
      setLoading(true);
      const url = status && status !== "ALL" ? `/complaints/status/${status}` : "/complaints";
      const response = await axios.get(url);
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = (val) => {
    setStatusFilter(val);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        (c.title && c.title.toLowerCase().includes(search.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (c.status && c.status.toUpperCase() === statusFilter.toUpperCase());

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  return (
    <div className="content-card">
      <ComplaintFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
      />

      {loading ? (
        <div className="empty-state">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>No complaints found</h3>
          <p>There are no records matching your criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <div className="complaints-table">
            <div className="table-header">
              <span>ID</span>
              <span>Complaint</span>
              <span>Category</span>
              <span>Status</span>
            </div>

            {filteredComplaints.map((complaint) => (
              <div
                className="table-row"
                key={complaint.id}
                onClick={() => {
                  if (onSelectComplaint) {
                    onSelectComplaint(complaint);
                  } else {
                    navigate(`/complaints/${complaint.id}`);
                  }
                }}
              >
                <span>#{complaint.id}</span>
                <div>
                  <strong>{complaint.title}</strong>
                  {complaint.description && <small>{complaint.description}</small>}
                </div>
                <span>{complaint.category || "-"}</span>
                <span>
                  <StatusBadge status={complaint.status} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintList;
