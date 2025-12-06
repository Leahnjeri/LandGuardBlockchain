import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      const token = res.data?.access_token || res.data?.token;
      if (!token) throw new Error("No token received");
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* LEFT SIDE */}
        <div className="auth-left">
          <h1>LandGuard</h1>
          <p>Login to manage and verify your land titles securely.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn-submit">Login</button>

            <p className="auth-switch">
              Don’t have an account? <Link to="/">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
