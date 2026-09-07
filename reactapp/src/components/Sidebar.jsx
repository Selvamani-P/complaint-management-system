import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const role = localStorage.getItem("role") || "CITIZEN";
    const name = localStorage.getItem("name") || role;

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="sidebar">

            {/* ================= LOGO ================= */}

            <div className="sidebar-logo">

                <div className="logo-box">
                    CMS
                </div>

                <div>
                    <h2>Complaint</h2>
                    <span>Management System</span>
                </div>

            </div>


            {/* ================= MENU TITLE ================= */}

            <div className="menu-title">
                MAIN MENU
            </div>


            {/* ================= NAVIGATION ================= */}

            <nav>

                {/* Dashboard */}

                <button
                    className={`menu-item ${
                        isActive("/dashboard")
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span>▣</span>
                    Dashboard
                </button>


                {/* Complaints */}

                <button
                    className={`menu-item ${
                        isActive("/complaints")
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/complaints")
                    }
                >
                    <span>▤</span>

                    {role === "CITIZEN"
                        ? "My Complaints"
                        : role === "EMPLOYEE"
                            ? "Complaints"
                            : "All Complaints"}
                </button>


                {/* New Complaint - Citizen only */}

                {role === "CITIZEN" && (
                    <button
                        className={`menu-item ${
                            isActive(
                                "/complaints/create"
                            )
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigate(
                                "/complaints/create"
                            )
                        }
                    >
                        <span>＋</span>
                        New Complaint
                    </button>
                )}


                {/* Employee Assigned Tasks */}

                {role === "EMPLOYEE" && (
                    <button
                        className={`menu-item ${
                            isActive("/assigned")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigate("/assigned")
                        }
                    >
                        <span>✓</span>
                        Assigned Tasks
                    </button>
                )}


                {/* Admin Users */}

                {role === "ADMIN" && (
                    <button
                        className={`menu-item ${
                            isActive("/users")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigate("/users")
                        }
                    >
                        <span>♙</span>
                        Users
                    </button>
                )}


                {/* Admin Reports */}

                {role === "ADMIN" && (
                    <button
                        className={`menu-item ${
                            isActive("/reports")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigate("/reports")
                        }
                    >
                        <span>▥</span>
                        Reports
                    </button>
                )}


                {/* Profile */}

                <button
                    className={`menu-item ${
                        isActive("/profile")
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/profile")
                    }
                >
                    <span>◉</span>
                    Profile
                </button>

            </nav>


            {/* ================= BOTTOM USER AREA ================= */}

            <div className="sidebar-bottom">

                <div className="user-box">

                    <div className="user-avatar">
                        {name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="user-info">

                        <strong>
                            {name}
                        </strong>

                        <span>
                            {role}
                        </span>

                    </div>

                </div>


                {/* Logout */}

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;