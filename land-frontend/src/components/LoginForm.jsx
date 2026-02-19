// src/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { jwtDecode } from "jwt-decode";

const ADMIN_EMAILS = new Set(["admin@landguard.co.ke"]); // keep only in frontend for fallback

export default function LoginForm({ role }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { ...form };
      if (role) payload.role = role;

      const res = await api.post("/auth/login", payload);

      const token = res.data?.access_token || res.data?.token;
      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);

      const typedEmail = (form.email || "").toLowerCase().trim();
      localStorage.setItem("user_email", typedEmail);

      const decoded = jwtDecode(token);
      console.log("JWT decoded:", decoded);

      const tokenEmail = (decoded.email || "").toLowerCase().trim();
      if (tokenEmail) localStorage.setItem("user_email", tokenEmail);

      const userRole = (decoded.role || decoded.user_role || "USER").toUpperCase();
      localStorage.setItem("role", userRole);

      const email = tokenEmail || typedEmail;
      const isAdmin =
        decoded.is_admin === true || ADMIN_EMAILS.has(email);

      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (userRole === "ADVOCATE") {
        navigate("/advocate", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>

      <div className="field">
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button className="btn btn-primary w-full" type="submit">Login</button>

      <p className="small-hint">
        Tip: Make sure you’re logging in with the same email you used during sign up.
      </p>
    </form>
  );
}
