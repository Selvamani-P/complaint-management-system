import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const role =
        localStorage.getItem("role") || "CITIZEN";

    const email =
        localStorage.getItem("email");

    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD COMPLAINTS
    // =====================================================

    useEffect(() => {
        loadComplaints();
    }, []);


    const loadComplaints = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/complaints");

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setComplaints(data);

        } catch (err) {

            console.error(
                "Dashboard error:",
                err
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // ROLE BASED COMPLAINTS
    // =====================================================

    let visibleComplaints =
        complaints;


    if (role === "CITIZEN") {

        visibleComplaints =
            complaints.filter(
                (complaint) =>
                    complaint.complainant?.email ===
                    email
            );

    }


    if (role === "EMPLOYEE") {

        visibleComplaints =
            complaints.filter(
                (complaint) =>
                    complaint.assignedEmployee?.email ===
                    email
            );

    }


    // =====================================================
    // STATUS COUNTS
    // =====================================================

    const total =
        visibleComplaints.length;


    const pending =
        visibleComplaints.filter(
            (complaint) =>
                complaint.status === "PENDING"
        ).length;


    const assigned =
        visibleComplaints.filter(
            (complaint) =>
                complaint.status === "ASSIGNED"
        ).length;


    const inProgress =
        visibleComplaints.filter(
            (complaint) =>
                complaint.status === "IN_PROGRESS"
        ).length;


    const resolved =
        visibleComplaints.filter(
            (complaint) =>
                complaint.status === "RESOLVED"
        ).length;


    const closed =
        visibleComplaints.filter(
            (complaint) =>
                complaint.status === "CLOSED"
        ).length;


    // =====================================================
    // DASHBOARD CONTENT
    // =====================================================

    const getDashboardContent = () => {

        if (role === "ADMIN") {

            return {

                title:
                    "Admin Dashboard",

                subtitle:
                    "Manage complaints and monitor the system.",

                stats: [

                    {
                        title:
                            "Total Complaints",

                        value:
                        total,

                        description:
                            "All registered complaints",

                        icon:
                            "▣"
                    },

                    {
                        title:
                            "Pending",

                        value:
                        pending,

                        description:
                            "Waiting for action",

                        icon:
                            "◷"
                    },

                    {
                        title:
                            "Resolved",

                        value:
                        resolved,

                        description:
                            "Successfully resolved",

                        icon:
                            "✓"
                    }

                ]
            };
        }


        if (role === "EMPLOYEE") {

            return {

                title:
                    "Employee Dashboard",

                subtitle:
                    "Review and manage your assigned complaints.",

                stats: [

                    {
                        title:
                            "Assigned",

                        value:
                        assigned,

                        description:
                            "Complaints assigned to you",

                        icon:
                            "▣"
                    },

                    {
                        title:
                            "In Progress",

                        value:
                        inProgress,

                        description:
                            "Currently being handled",

                        icon:
                            "◷"
                    },

                    {
                        title:
                            "Resolved",

                        value:
                        resolved,

                        description:
                            "Complaints completed",

                        icon:
                            "✓"
                    }

                ]
            };
        }


        return {

            title:
                "Citizen Dashboard",

            subtitle:
                "Track your complaints and stay updated.",

            stats: [

                {
                    title:
                        "My Complaints",

                    value:
                    total,

                    description:
                        "Complaints submitted",

                    icon:
                        "▣"
                },

                {
                    title:
                        "Pending",

                    value:
                    pending,

                    description:
                        "Waiting for action",

                    icon:
                        "◷"
                },

                {
                    title:
                        "Resolved",

                    value:
                    resolved,

                    description:
                        "Successfully resolved",

                    icon:
                        "✓"
                }

            ]
        };
    };


    const content =
        getDashboardContent();


    // =====================================================
    // RECENT COMPLAINTS
    // =====================================================

    const recentComplaints =
        [...visibleComplaints]
            .sort(
                (a, b) =>
                    new Date(
                        b.submittedAt || 0
                    ) -
                    new Date(
                        a.submittedAt || 0
                    )
            )
            .slice(0, 5);


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        if (status === "RESOLVED") {
            return "status status-resolved";
        }

        if (
            status === "ASSIGNED" ||
            status === "IN_PROGRESS"
        ) {
            return "status status-progress";
        }

        if (status === "CLOSED") {
            return "status status-resolved";
        }

        return "status status-pending";
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="dashboard-layout">

            <Sidebar />


            <main className="main-content">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="topbar">

                    <div>

                        <h1 className="welcome-title">
                            {content.title}
                        </h1>

                        <p className="welcome-text">
                            {content.subtitle}
                        </p>

                    </div>


                    <div className="role-badge">
                        {role}
                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="error-state">
                        {error}
                    </div>

                )}


                {/* =================================================
                    STATS
                ================================================= */}

                <div className="stats-grid">

                    {content.stats.map(
                        (stat) => (

                            <StatCard
                                key={stat.title}
                                title={stat.title}
                                value={
                                    loading
                                        ? "..."
                                        : stat.value
                                }
                                description={
                                    stat.description
                                }
                                icon={stat.icon}
                            />

                        )
                    )}

                </div>


                {/* =================================================
                    DASHBOARD GRID
                ================================================= */}

                <div className="dashboard-grid">


                    {/* =================================================
                        RECENT COMPLAINTS
                    ================================================= */}

                    <div className="content-card">

                        <div className="card-header-row">

                            <div>

                                <h2>
                                    Recent Complaints
                                </h2>

                                <p className="card-subtitle">
                                    Latest complaint activity
                                </p>

                            </div>

                            <button
                                className="text-button"
                                onClick={() =>
                                    navigate(
                                        "/complaints"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        {loading && (

                            <div className="empty-state">

                                Loading complaints...

                            </div>

                        )}


                        {!loading &&
                            recentComplaints.length === 0 && (

                                <div className="empty-state">

                                    <div className="empty-icon">
                                        ✓
                                    </div>

                                    <h3>
                                        No complaints
                                    </h3>

                                    <p>
                                        There are no complaints
                                        to display.
                                    </p>

                                </div>

                            )}


                        {!loading &&
                            recentComplaints.length > 0 && (

                                <div>

                                    {recentComplaints.map(
                                        (complaint) => (

                                            <div
                                                className="complaint-row"
                                                key={
                                                    complaint.id
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/complaints/${complaint.id}`
                                                    )
                                                }
                                            >

                                                <div>

                                                    <div className="complaint-title">

                                                        {
                                                            complaint.title
                                                        }

                                                    </div>

                                                    <div className="complaint-meta">

                                                        Complaint #
                                                        {
                                                            complaint.id
                                                        }

                                                    </div>

                                                </div>


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


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div className="content-card">

                        <h2>
                            Quick Actions
                        </h2>


                        <div className="quick-actions">


                            {/* CITIZEN */}

                            {role === "CITIZEN" && (
                                <>

                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/complaints/create"
                                            )
                                        }
                                    >
                                        + New Complaint
                                    </button>


                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/complaints"
                                            )
                                        }
                                    >
                                        View Complaints
                                    </button>

                                </>
                            )}


                            {/* EMPLOYEE */}

                            {role === "EMPLOYEE" && (
                                <>

                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/assigned"
                                            )
                                        }
                                    >
                                        Assigned Tasks
                                    </button>


                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/complaints"
                                            )
                                        }
                                    >
                                        View Complaints
                                    </button>

                                </>
                            )}


                            {/* ADMIN */}

                            {role === "ADMIN" && (
                                <>

                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/complaints"
                                            )
                                        }
                                    >
                                        All Complaints
                                    </button>


                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/users"
                                            )
                                        }
                                    >
                                        Manage Users
                                    </button>


                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            navigate(
                                                "/reports"
                                            )
                                        }
                                    >
                                        Reports
                                    </button>

                                </>
                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    EXTRA STATUS SUMMARY
                ================================================= */}

                {!loading && (

                    <div className="content-card dashboard-status-card">

                        <h2>
                            Complaint Status
                        </h2>

                        <div className="status-summary">

                            <div className="status-summary-item">

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {pending}
                                </strong>

                            </div>


                            <div className="status-summary-item">

                                <span>
                                    Assigned
                                </span>

                                <strong>
                                    {assigned}
                                </strong>

                            </div>


                            <div className="status-summary-item">

                                <span>
                                    In Progress
                                </span>

                                <strong>
                                    {inProgress}
                                </strong>

                            </div>


                            <div className="status-summary-item">

                                <span>
                                    Resolved
                                </span>

                                <strong>
                                    {resolved}
                                </strong>

                            </div>


                            <div className="status-summary-item">

                                <span>
                                    Closed
                                </span>

                                <strong>
                                    {closed}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Dashboard;