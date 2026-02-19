// src/routes/AdminGate.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ADMIN_EMAILS = new Set(["admin@landguard.co.ke"]);

export default function AdminGate() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const storedEmail = (localStorage.getItem("user_email") || "").toLowerCase().trim();

  try {
    const decoded = jwtDecode(token);
    const tokenEmail = (decoded.email || "").toLowerCase().trim();
    const email = tokenEmail || storedEmail;

    const isAdmin = decoded.is_admin === true || ADMIN_EMAILS.has(email);

    if (!isAdmin) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
  } catch {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
}
