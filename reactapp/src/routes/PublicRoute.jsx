import React from "react";
import { Navigate } from "react-router-dom";

export function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp || Date.now() < payload.exp * 1000) {
          return <Navigate to="/dashboard" replace />;
        }
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      // If token cannot be decoded, let user see public route
    }
  }

  return children;
}

export default PublicRoute;
