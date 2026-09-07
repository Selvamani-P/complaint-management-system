import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Reports() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await api.get("/complaints");

            setComplaints(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Report loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    const total = complaints.length;

    const pending = complaints.filter(
        (c) => c.status?.toUpperCase() === "PENDING"
    ).length;

    const inProgress = complaints.filter(
        (c) =>
            c.status?.toUpperCase() === "IN_PROGRESS" ||
            c.status?.toUpperCase() === "IN PROGRESS"
    ).length;

    const resolved = complaints.filter(
        (c) => c.status?.toUpperCase() === "RESOLVED"
    ).length;

    const assigned = complaints.filter(
        (c) => c.assignedEmployee
    ).length;

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                <div className="topbar">

                    <div>
                        <h1 className="welcome-title">
                            Reports
                        </h1>

                        <p className="welcome-text">
                            Overview of complaint activity.
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="content-card">
                        <div className="empty-state">
                            Loading reports...
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="report-grid">

                            <div className="report-card">
                                <span>Total Complaints</span>
                                <strong>{total}</strong>
                            </div>

                            <div className="report-card">
                                <span>Pending</span>
                                <strong>{pending}</strong>
                            </div>

                            <div className="report-card">
                                <span>In Progress</span>
                                <strong>{inProgress}</strong>
                            </div>

                            <div className="report-card">
                                <span>Resolved</span>
                                <strong>{resolved}</strong>
                            </div>

                            <div className="report-card">
                                <span>Assigned</span>
                                <strong>{assigned}</strong>
                            </div>

                            <div className="report-card">
                                <span>Unassigned</span>
                                <strong>
                                    {total - assigned}
                                </strong>
                            </div>

                        </div>

                        <div className="content-card report-summary">

                            <h2>Complaint Summary</h2>

                            <div className="summary-row">
                                <span>Pending</span>
                                <strong>{pending}</strong>
                            </div>

                            <div className="summary-row">
                                <span>In Progress</span>
                                <strong>{inProgress}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Resolved</span>
                                <strong>{resolved}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Assigned to Employees</span>
                                <strong>{assigned}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Waiting for Assignment</span>
                                <strong>{total - assigned}</strong>
                            </div>

                        </div>
                    </>
                )}

            </main>

        </div>
    );
}

export default Reports;