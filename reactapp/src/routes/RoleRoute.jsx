import React from "react";
import { Navigate } from "react-router-dom";

export function RoleRoute({ allowedRoles = [], children }) {
  const role = (localStorage.getItem("role") || "").toUpperCase();

  const isAllowed = allowedRoles.some(
    (allowed) => allowed.toUpperCase() === role
  );

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
