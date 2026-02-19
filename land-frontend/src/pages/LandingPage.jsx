import React, { useMemo, useState } from "react";
import { ShieldCheck, FileText, Building2, Scale, User, X, ArrowRight } from "lucide-react";
import AuthModal from "../components/AuthModal";
import "../styles/landing.css";

const ROLES = [
  {
    key: "USER",
    title: "Normal User",
    desc: "Verify land records and initiate transfers securely.",
    icon: <User className="w-6 h-6" />,
  },
  {
    key: "ADVOCATE",
    title: "Advocate",
    desc: "Handle inheritance and court-order transfers with confidence.",
    icon: <Scale className="w-6 h-6" />,
  },
  {
    key: "ORG",
    title: "Organization",
    desc: "Manage multiple properties and approvals under one account.",
    icon: <Building2 className="w-6 h-6" />,
  },
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [selectedRole, setSelectedRole] = useState("USER");

  const openAuth = (nextMode, roleKey) => {
    setMode(nextMode);
    setSelectedRole(roleKey);
    setAuthOpen(true);
  };

  const closeAuth = () => setAuthOpen(false);

  const roleLabel = useMemo(() => {
    const r = ROLES.find((x) => x.key === selectedRole);
    return r?.title || "User";
  }, [selectedRole]);

  return (
    <div className="landing-page">
      {/* Top Nav */}
      <header className="landing-nav">
        <div className="brand">
          <div className="brand-badge">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="brand-name">LandGuard</div>
            <div className="brand-sub">Land Verification & Transfer</div>
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => openAuth("login", selectedRole)}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => openAuth("signup", selectedRole)}>
            Sign up
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-pill">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure • Verified • Account-based confirmations</span>
          </div>

          <h1 className="hero-title">
            Verify and transfer land ownership with less paperwork.
          </h1>

          <p className="hero-text">
            LandGuard reduces fraud by using account confirmation, audit trails, and role-based workflows for owners,
            advocates, and organizations.
          </p>

          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => openAuth("signup", selectedRole)}>
              Get started <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost" onClick={() => openAuth("login", selectedRole)}>
              I already have an account
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">Role-based</div>
              <div className="stat-label">Owner • Advocate • Organization</div>
            </div>
            <div className="stat">
              <div className="stat-num">Audit trail</div>
              <div className="stat-label">Timestamps & signatures</div>
            </div>
            <div className="stat">
              <div className="stat-num">Secure</div>
              <div className="stat-label">Verification-first flow</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <div className="hero-card-top">
              <div className="hero-card-icon">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="hero-card-title">How it works</div>
                <div className="hero-card-sub">Short, simple, professional</div>
              </div>
            </div>

            <ol className="hero-steps">
              <li>
                <span className="step-dot" />
                Owner/Advocate initiates transfer with details.
              </li>
              <li>
                <span className="step-dot" />
                New owner confirms inside their own account.
              </li>
              <li>
                <span className="step-dot" />
                Admin reviews and approves the registry update.
              </li>
            </ol>

            <div className="hero-card-bottom">
              <p className="hero-card-note">
                Choose your account type to continue:
              </p>

              <div className="role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    className={`role-card ${selectedRole === r.key ? "active" : ""}`}
                    onClick={() => setSelectedRole(r.key)}
                    type="button"
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div className="role-info">
                      <div className="role-title">{r.title}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="role-actions">
                <button className="btn btn-ghost" onClick={() => openAuth("login", selectedRole)}>
                  Login as {roleLabel}
                </button>
                <button className="btn btn-primary" onClick={() => openAuth("signup", selectedRole)}>
                  Sign up as {roleLabel} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="hero-bg-blur" />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Designed for real workflows</h2>
        <p className="section-sub">
          A modern experience that reduces fraud and friction while keeping things reviewable and auditable.
        </p>

        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon"><ShieldCheck className="w-5 h-5" /></div>
            <div className="feature-title">Account confirmation</div>
            <div className="feature-text">New owner confirms inside their account — no ID photo uploads.</div>
          </div>

          <div className="feature">
            <div className="feature-icon"><Scale className="w-5 h-5" /></div>
            <div className="feature-title">Role-based actions</div>
            <div className="feature-text">Owners, advocates, and organizations see only what they’re allowed to do.</div>
          </div>

          <div className="feature">
            <div className="feature-icon"><FileText className="w-5 h-5" /></div>
            <div className="feature-title">Audit trail</div>
            <div className="feature-text">Signatures, timestamps, and reference numbers make disputes easier to resolve.</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} LandGuard</div>
        <div className="footer-links">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </footer>

      {/* Modal */}
      <AuthModal
        open={authOpen}
        mode={mode}
        role={selectedRole}
        onClose={closeAuth}
        onSwitchMode={(m) => setMode(m)}
        onSwitchRole={(r) => setSelectedRole(r)}
      />
    </div>
  );
}
