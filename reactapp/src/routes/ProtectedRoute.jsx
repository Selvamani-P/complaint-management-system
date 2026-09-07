import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Helper function to verify whether a JWT is expired
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false; // not a standard 3-part JWT, trust presence
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return false;
  }
}

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    return <Navigate to="/login?sessionExpired=true" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
