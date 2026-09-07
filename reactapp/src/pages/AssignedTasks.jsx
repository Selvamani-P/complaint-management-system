import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function AssignedTasks() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/complaints");

            const allComplaints = Array.isArray(response.data)
                ? response.data
                : [];

            const email = localStorage.getItem("email");

            /*
             * Show only complaints assigned to
             * the currently logged-in employee.
             */
            const assigned = allComplaints.filter(
                (complaint) =>
                    complaint.assignedEmployee &&
                    complaint.assignedEmployee.email === email
            );

            setComplaints(assigned);

        } catch (err) {
            console.error("Assigned complaints error:", err);
            setError("Unable to load assigned complaints.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const value = status?.toUpperCase();

        if (value === "RESOLVED") {
            return "status status-resolved";
        }

        if (
            value === "IN_PROGRESS" ||
            value === "IN PROGRESS"
        ) {
            return "status status-progress";
        }

        return "status status-pending";
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                {/* HEADER */}

                <div className="topbar">

                    <div>
                        <h1 className="welcome-title">
                            Assigned Tasks
                        </h1>

                        <p className="welcome-text">
                            View complaints assigned to you.
                        </p>
                    </div>

                </div>


                {/* CONTENT */}

                <div className="content-card">

                    {loading && (
                        <div className="empty-state">
                            Loading assigned tasks...
                        </div>
                    )}


                    {!loading && error && (
                        <div className="error-state">
                            {error}
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        complaints.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No assigned tasks
                                </h3>

                                <p>
                                    No complaints have been
                                    assigned to you yet.
                                </p>

                            </div>
                        )}


                    {!loading &&
                        !error &&
                        complaints.length > 0 && (

                            <div className="complaints-table">

                                {/* HEADER */}

                                <div className="table-header">

                                    <span>ID</span>

                                    <span>
                                        Complaint
                                    </span>

                                    <span>
                                        Category
                                    </span>

                                    <span>
                                        Status
                                    </span>

                                </div>


                                {/* ROWS */}

                                {complaints.map(
                                    (complaint) => (

                                        <div
                                            className="table-row"
                                            key={complaint.id}
                                            onClick={() =>
                                                navigate(
                                                    `/complaints/${complaint.id}`
                                                )
                                            }
                                        >

                                            <span>
                                                #{complaint.id}
                                            </span>


                                            <div>

                                                <strong>
                                                    {
                                                        complaint.title
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        complaint.description
                                                    }
                                                </small>

                                            </div>


                                            <span>
                                                {
                                                    complaint.category ||
                                                    "-"
                                                }
                                            </span>


                                            <span
                                                className={getStatusClass(
                                                    complaint.status
                                                )}
                                            >
                                                {
                                                    complaint.status ||
                                                    "PENDING"
                                                }
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>
                        )}

                </div>

            </main>

        </div>
    );
}

export default AssignedTasks;