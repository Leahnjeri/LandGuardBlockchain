import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../api";

export default function SignupForm({ role }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // common
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: "",
    email: "",
    password: "",
    confirmPassword: "",

    // advocate
    advocateLicenseNo: "",

    // organization
    orgName: "",
    orgRegNo: "",
    orgPhone: "",
  });

  const isAdvocate = role === "ADVOCATE";
  const isOrg = role === "ORG";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePhoneChange = (val) => setForm({ ...form, phone: val });

  const validate = () => {
    if (form.password !== form.confirmPassword) return "Passwords do not match";

    if (isAdvocate && !form.advocateLicenseNo.trim()) return "Advocate license number is required";

    if (isOrg) {
      if (!form.orgName.trim()) return "Organization name is required";
      if (!form.orgRegNo.trim()) return "Organization registration number is required";
      if (!form.orgPhone.trim()) return "Organization phone is required";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) return setError(err);

    // ✅ Payload: keep it compatible with your backend now, and add role + extra fields
    const payload = {
      role,
      first_name: form.firstName,
      last_name: form.lastName,
      phone_number: form.phone,
      national_id: form.nationalId,
      email: form.email,
      password: form.password,

      advocate_license_no: form.advocateLicenseNo || null,
      org_name: form.orgName || null,
      org_reg_no: form.orgRegNo || null,
      org_phone: form.orgPhone || null,
    };

    try {
      const res = await api.post("/auth/signup", payload);
      const token = res.data?.access_token || res.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
      }

      // Later you can route different dashboards. For now keep dashboard.
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {!isOrg && (
        <>
          <div className="two-col">
            <div className="field">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label>Phone Number</label>
            <PhoneInput country={"ke"} value={form.phone} onChange={handlePhoneChange} inputStyle={{ width: "100%" }} />
          </div>

          <div className="field">
            <label>National ID</label>
            <input name="nationalId" value={form.nationalId} onChange={handleChange} required />
          </div>
        </>
      )}

      {isOrg && (
        <>
          <div className="field">
            <label>Organization Name</label>
            <input name="orgName" value={form.orgName} onChange={handleChange} required />
          </div>

          <div className="two-col">
            <div className="field">
              <label>Registration Number</label>
              <input name="orgRegNo" value={form.orgRegNo} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Organization Phone</label>
              <input name="orgPhone" value={form.orgPhone} onChange={handleChange} required placeholder="e.g. 0712345678" />
            </div>
          </div>
        </>
      )}

      {isAdvocate && (
        <div className="field">
          <label>Advocate License No (LSK)</label>
          <input name="advocateLicenseNo" value={form.advocateLicenseNo} onChange={handleChange} required placeholder="e.g. LSK/12345" />
        </div>
      )}

      <div className="field">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>

      <div className="two-col">
        <div className="field">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button className="btn btn-primary w-full" type="submit">
        Sign up
      </button>

      <p className="small-hint">
        After signing up, your role will determine what actions you can perform in the system.
      </p>
    </form>
  );
}
