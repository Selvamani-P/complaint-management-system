import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Users() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            console.error("Users loading error:", err);

            if (err.response?.status === 403) {
                setError("You are not authorized to view users.");
            } else {
                setError("Unable to load users.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getRoleClass = (role) => {
        const value = role?.toUpperCase();

        if (value === "ADMIN") {
            return "role-badge role-admin";
        }

        if (value === "EMPLOYEE") {
            return "role-badge role-employee";
        }

        return "role-badge role-citizen";
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                <div className="topbar">

                    <div>
                        <h1 className="welcome-title">
                            Users
                        </h1>

                        <p className="welcome-text">
                            Manage system users and their roles.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </div>

                <div className="content-card">

                    {loading && (
                        <div className="empty-state">
                            Loading users...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="error-state">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        users.length === 0 && (
                            <div className="empty-state">
                                <h3>No users found</h3>
                                <p>
                                    There are no users available.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        users.length > 0 && (

                            <div className="users-table">

                                <div className="users-header">
                                    <span>ID</span>
                                    <span>Name</span>
                                    <span>Email</span>
                                    <span>Phone</span>
                                    <span>Role</span>
                                </div>

                                {users.map((user) => (

                                    <div
                                        className="users-row"
                                        key={user.id}
                                    >

                                        <span className="user-id">
                                            #{user.id}
                                        </span>

                                        <strong>
                                            {user.name || "-"}
                                        </strong>

                                        <span>
                                            {user.email || "-"}
                                        </span>

                                        <span>
                                            {user.phone || "-"}
                                        </span>

                                        <span>
                                            <span
                                                className={getRoleClass(
                                                    user.role
                                                )}
                                            >
                                                {user.role || "CITIZEN"}
                                            </span>
                                        </span>

                                    </div>

                                ))}

                            </div>
                        )}

                </div>

            </main>

        </div>
    );
}

export default Users;