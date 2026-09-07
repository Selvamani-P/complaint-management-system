import React from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export function EmployeeRoute({ children }) {
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isAllowed = role === "EMPLOYEE" || role === "ADMIN";

  return (
    <ProtectedRoute>
      {isAllowed ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

export default EmployeeRoute;
