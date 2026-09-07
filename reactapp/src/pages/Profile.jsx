import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Profile() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role") || "CITIZEN";
    const email = localStorage.getItem("email") || "Not available";
    const name = localStorage.getItem("name") || role;

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                <div className="topbar">
                    <div>
                        <h1 className="welcome-title">
                            My Profile
                        </h1>

                        <p className="welcome-text">
                            View your account information.
                        </p>
                    </div>
                </div>

                <div className="profile-container">

                    <div className="profile-card">

                        <div className="profile-header">

                            <div className="profile-avatar">
                                {name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h2>{name}</h2>

                                <span className="profile-role">
                                    {role}
                                </span>
                            </div>

                        </div>

                        <div className="profile-details">

                            <div className="profile-detail">
                                <span>Name</span>
                                <strong>{name}</strong>
                            </div>

                            <div className="profile-detail">
                                <span>Email</span>
                                <strong>{email}</strong>
                            </div>

                            <div className="profile-detail">
                                <span>Role</span>
                                <strong>{role}</strong>
                            </div>

                            <div className="profile-detail">
                                <span>Account Status</span>
                                <strong className="active-account">
                                    Active
                                </strong>
                            </div>

                        </div>

                        <button
                            className="profile-logout"
                            onClick={logout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Profile;