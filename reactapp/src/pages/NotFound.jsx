import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

export function NotFound() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        backgroundColor: "var(--bg-app)"
      }}
    >
      <div
        style={{
          fontSize: "72px",
          fontWeight: "800",
          color: "var(--primary-600)",
          lineHeight: 1
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "var(--slate-900)",
          margin: "16px 0 8px"
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          color: "var(--slate-500)",
          maxWidth: "420px",
          marginBottom: "24px"
        }}
      >
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(token ? "/dashboard" : "/login")}
        >
          {token ? "Go to Dashboard" : "Go to Login"}
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
