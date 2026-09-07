import React from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export function AdminRoute({ children }) {
  const role = (localStorage.getItem("role") || "").toUpperCase();

  return (
    <ProtectedRoute>
      {role === "ADMIN" ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

export default AdminRoute;
