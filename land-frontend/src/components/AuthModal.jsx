import React, { useEffect } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import "../styles/landing.css";

const ROLE_LABELS = {
  USER: "Normal User",
  ADVOCATE: "Advocate",
  ORG: "Organization",
};

export default function AuthModal({ open, mode, role, onClose, onSwitchMode, onSwitchRole }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const title = mode === "login" ? "Login" : "Create Account";
  const roleLabel = ROLE_LABELS[role] || "User";

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-subtitle">Account type: <b>{roleLabel}</b></div>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-tabs">
          <button className={`tab ${role === "USER" ? "active" : ""}`} onClick={() => onSwitchRole("USER")}>
            Normal User
          </button>
          <button className={`tab ${role === "ADVOCATE" ? "active" : ""}`} onClick={() => onSwitchRole("ADVOCATE")}>
            Advocate
          </button>
          <button className={`tab ${role === "ORG" ? "active" : ""}`} onClick={() => onSwitchRole("ORG")}>
            Organization
          </button>
        </div>

        <div className="modal-body">
          {mode === "login" ? <LoginForm role={role} /> : <SignupForm role={role} />}

          <div className="modal-switch">
            {mode === "login" ? (
              <p>
                Don’t have an account?{" "}
                <button className="link-btn" onClick={() => onSwitchMode("signup")}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button className="link-btn" onClick={() => onSwitchMode("login")}>
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
