import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../api";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoneChange = (val) =>
    setForm({ ...form, phone: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      phone_number: form.phone,
      national_id: form.nationalId,
      email: form.email,
      password: form.password,
    };

    try {
      const res = await api.post("/auth/signup", payload);
      const token = res.data?.access_token || res.data?.token;

      if (token) localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-left">
          <h1>LandGuard</h1>
          <p>Secure land verification and transfer at your fingertips.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create Account</h2>

            <div className="input-row">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label>Phone Number</label>
              <PhoneInput
                country={"ke"}
                value={form.phone}
                onChange={handlePhoneChange}
                inputStyle={{ width: "100%" }}
              />
            </div>

            <div>
              <label>National ID</label>
              <input
                type="text"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="input-row">
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

              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn-submit">Sign up</button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
