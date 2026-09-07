import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/register", {
                name: name,
                email: email,
                phone: phone,
                password: password
            });

            setMessage(
                response.data?.message ||
                response.data ||
                "Registration successful!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error("Registration Error:", error);

            if (error.response) {
                setMessage(
                    error.response.data?.message ||
                    error.response.data ||
                    "Registration failed"
                );
            } else {
                setMessage("Unable to connect to the server");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.card}>

                <div style={styles.logo}>
                    CMS
                </div>

                <h1 style={styles.title}>
                    Create Account
                </h1>

                <p style={styles.subtitle}>
                    Register for the Complaint Management System
                </p>

                <form onSubmit={handleRegister}>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Phone
                        </label>

                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                {message && (
                    <p style={styles.message}>
                        {message}
                    </p>
                )}

                <p style={styles.loginText}>
                    Already have an account?{" "}

                    <Link
                        to="/login"
                        style={styles.link}
                    >
                        Sign In
                    </Link>
                </p>

            </div>

        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #eef4ff, #f8fafc)",
        padding: "20px"
    },

    card: {
        width: "400px",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "18px",
        boxShadow: "0 15px 40px rgba(15, 23, 42, 0.12)"
    },

    logo: {
        width: "55px",
        height: "55px",
        borderRadius: "14px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        fontWeight: "bold",
        fontSize: "16px"
    },

    title: {
        textAlign: "center",
        margin: "0",
        color: "#172033",
        fontSize: "27px"
    },

    subtitle: {
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
        marginBottom: "28px"
    },

    formGroup: {
        marginBottom: "16px"
    },

    label: {
        display: "block",
        marginBottom: "7px",
        color: "#334155",
        fontSize: "14px",
        fontWeight: "600"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #dbe2ea",
        borderRadius: "9px",
        fontSize: "14px",
        outline: "none"
    },

    button: {
        width: "100%",
        padding: "13px",
        marginTop: "8px",
        border: "none",
        borderRadius: "9px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    message: {
        textAlign: "center",
        color: "#2563eb",
        fontSize: "14px",
        fontWeight: "600",
        marginTop: "18px"
    },

    loginText: {
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
        marginTop: "24px"
    },

    link: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: "600"
    }
};

export default Register;