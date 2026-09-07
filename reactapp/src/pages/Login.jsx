import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password
            });

            console.log("Login Response:", response.data);

            /*
             * Save JWT token
             */
            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }

            /*
             * Save role
             */
            if (response.data.role) {
                localStorage.setItem(
                    "role",
                    response.data.role
                );
            }

            /*
             * Save name
             */
            if (response.data.name) {
                localStorage.setItem(
                    "name",
                    response.data.name
                );
            }

            /*
             * Save email
             */
            if (response.data.email) {
                localStorage.setItem(
                    "email",
                    response.data.email
                );
            } else {
                /*
                 * If backend doesn't return email,
                 * use the email entered in the form.
                 */
                localStorage.setItem(
                    "email",
                    email
                );
            }

            /*
             * Show success message
             */
            setMessage("Login successful!");

            /*
             * Go to dashboard
             */
            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            if (error.response) {

                if (error.response.status === 401) {
                    setMessage(
                        "Invalid email or password."
                    );
                } else if (error.response.status === 403) {
                    setMessage(
                        "Access denied. Please check your account."
                    );
                } else {
                    setMessage(
                        error.response.data?.message ||
                        error.response.data ||
                        "Login failed."
                    );
                }

            } else {

                setMessage(
                    "Unable to connect to the server."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.box}>

                {/* LOGO */}

                <div style={styles.logo}>
                    CMS
                </div>

                <h1 style={styles.title}>
                    Welcome Back
                </h1>

                <p style={styles.subtitle}>
                    Sign in to Complaint Management System
                </p>

                {/* FORM */}

                <form onSubmit={handleLogin}>

                    {/* EMAIL */}

                    <div style={styles.formGroup}>

                        <label style={styles.label}>
                            Email
                        </label>

                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* PASSWORD */}

                    <div style={styles.formGroup}>

                        <label style={styles.label}>
                            Password
                        </label>

                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

                {/* MESSAGE */}

                {message && (
                    <div
                        style={
                            message.includes("successful")
                                ? styles.success
                                : styles.error
                        }
                    >
                        {message}
                    </div>
                )}

                {/* REGISTER */}

                <p style={styles.registerText}>
                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        style={styles.link}
                    >
                        Create Account
                    </Link>
                </p>

            </div>

        </div>
    );
}


/* =====================================================
   STYLES
   ===================================================== */

const styles = {

    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(135deg, #eef4ff, #f8fafc)",
        padding: "20px",
        boxSizing: "border-box"
    },

    box: {
        width: "100%",
        maxWidth: "400px",
        padding: "38px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e5eaf1",
        boxShadow:
            "0 12px 35px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box"
    },

    logo: {
        width: "55px",
        height: "55px",
        margin: "0 auto 18px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "700",
        letterSpacing: "1px"
    },

    title: {
        margin: "0",
        textAlign: "center",
        color: "#172033",
        fontSize: "27px",
        fontWeight: "700"
    },

    subtitle: {
        marginTop: "8px",
        marginBottom: "30px",
        textAlign: "center",
        color: "#718096",
        fontSize: "14px"
    },

    formGroup: {
        marginBottom: "20px"
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#334155",
        fontSize: "14px",
        fontWeight: "600"
    },

    input: {
        width: "100%",
        padding: "12px 13px",
        border: "1px solid #d6deea",
        borderRadius: "8px",
        outline: "none",
        boxSizing: "border-box",
        fontSize: "14px",
        color: "#1e293b",
        backgroundColor: "#ffffff"
    },

    button: {
        width: "100%",
        padding: "12px",
        marginTop: "5px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    success: {
        marginTop: "18px",
        padding: "10px",
        borderRadius: "7px",
        backgroundColor: "#ecfdf5",
        color: "#15803d",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "600"
    },

    error: {
        marginTop: "18px",
        padding: "10px",
        borderRadius: "7px",
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "600"
    },

    registerText: {
        marginTop: "25px",
        marginBottom: "0",
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px"
    },

    link: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: "600"
    }
};

export default Login;