// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplyLandSearch from "./landSearch/ApplyLandSearch";
import TransferOwnership from "./TransferOwnership";
import MyProperties from "./MyProperties";
import OwnerSearchRequests from "./landSearch/OwnerSearchRequests";
import NotificationBell from "../components/NotificationBell";
import "../styles/dashboard.css";
import { LayoutGroup, motion } from "framer-motion";
import IncomingTransfersList from "./IncomingTransfersList";
import NewOwnerAcceptTransfer from "./NewOwnerAcceptTransfer";
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  Repeat2,
  Building2,
  ClipboardCheck,
  LogOut,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* -----------------------------
   Helpers (your same logic)
------------------------------ */
function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getCurrentUserInfo() {
  const savedName = localStorage.getItem("full_name") || localStorage.getItem("name");
  const savedRole = localStorage.getItem("role");

  const token = localStorage.getItem("token");
  const payload = decodeJwtPayload(token);

  const role = savedRole || payload?.role || payload?.user_role || payload?.type || "USER";
  const name =
    savedName ||
    payload?.full_name ||
    payload?.name ||
    payload?.username ||
    payload?.email ||
    "Unknown User";

  const normalizedRole = String(role).toUpperCase();
  const roleLabel =
    normalizedRole === "ADVOCATE"
      ? "Advocate"
      : normalizedRole === "ORG"
      ? "Organization"
      : "User";

  return { name, role: normalizedRole, roleLabel };
}

/* -----------------------------
   Small UI helpers
------------------------------ */
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 border border-black/10 text-gray-700">
      {children}
    </span>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/10 shadow-sm p-5">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-4xl font-extrabold text-[#4e342e]">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/80 backdrop-blur border border-black/10 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(() => getCurrentUserInfo());

  // ✅ Resources dropdown
  const [showResources, setShowResources] = useState(false);
  const RESOURCES = [
    { label: "Land Sale Agreement", file: "/forms/sale_agreement_kenya.jpg" },
    { label: "Gift Deed Form", file: "/forms/gift-deed.pdf" },
    { label: "Transfer Instructions", file: "/forms/transfer-guide.pdf" },
  ];

  // ✅ incoming pending transfer count (new owner side)
  const [pendingTransfers, setPendingTransfers] = useState(0);

  // ✅ controls what we show inside the “incoming-transfers” view
  const [transferView, setTransferView] = useState({
    mode: "list", // "list" | "accept"
    acceptToken: null,
    transferId: null,
  });

  useEffect(() => {
    setUserInfo(getCurrentUserInfo());
  }, []);

  // ✅ load pending count (for NEW OWNER)
  useEffect(() => {
    const loadPendingTransfers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/transfer/incoming/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setPendingTransfers(Number(data.pending ?? 0));
      } catch (e) {
        console.error(e);
      }
    };

    loadPendingTransfers();
    const t = setInterval(loadPendingTransfers, 15000);
    return () => clearInterval(t);
  }, []);

  // ---------- Global Notification ----------
  const [notification, setNotification] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message, duration = 3000) => {
    setNotification(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => setNotification(""), 300);
    }, duration);
  };

  // ✅ open list INSIDE dashboard
  const openIncomingTransfersList = () => {
    setActiveTab("incoming-transfers");
    setTransferView({ mode: "list", acceptToken: null, transferId: null });
  };

  // ✅ open accept INSIDE dashboard (token OR transferId)
  const openAcceptInsideDashboard = ({ acceptToken = null, transferId = null } = {}) => {
    setActiveTab("incoming-transfers");
    setTransferView({ mode: "accept", acceptToken, transferId });
  };

  const page = useMemo(() => {
    const map = {
      dashboard: { title: "Dashboard", sub: "Overview & quick actions." },
      verifyLandPage: { title: "Search Land", sub: "Apply for a land search request." },
      transfer: { title: "Transfer Ownership", sub: "Initiate transfer + invite new owner (Option B)." },
      properties: { title: "My Properties", sub: "View your registered titles." },
      "owner-requests": { title: "Search Approvals", sub: "Approve or review search requests." },

      // ✅ internal tab (not in sidebar)
      "incoming-transfers": { title: "Pending Transfers", sub: "Review & accept incoming transfers." },
    };
    return map[activeTab] || map.dashboard;
  }, [activeTab]);

  const navItems = [
    { key: "dashboard", label: "Home", icon: LayoutDashboard },
    { key: "verifyLandPage", label: "Search Land", icon: Search },
    { key: "transfer", label: "Transfer Ownership", icon: Repeat2 },
    { key: "properties", label: "My Properties", icon: Building2 },
    { key: "owner-requests", label: "Search Approvals", icon: ClipboardCheck },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 12% 8%, rgba(78,52,46,0.14), transparent 55%)," +
          "radial-gradient(900px 500px at 90% 18%, rgba(34,197,94,0.12), transparent 55%)," +
          "linear-gradient(180deg, #ffffff 0%, #f7f4f2 100%)",
      }}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-30 px-6 pt-6">
        <Surface className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#4e342e] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-[#4e342e] truncate">
                    LandGuard
                  </h1>
                  <Pill>
                    <Sparkles className="w-3.5 h-3.5" />
                    Light Mode
                  </Pill>
                </div>
                <p className="text-xs text-gray-600 truncate">
                  Secure land verification & transfer
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">

              {/* ✅ Resources Hover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowResources(true)}
                onMouseLeave={() => {
                  // small delay prevents flicker
                  setTimeout(() => setShowResources(false), 120);
                }}
              >
                <span className="cursor-pointer text-sm font-semibold text-[#4e342e] hover:underline">
                  Resources
                </span>

                {showResources && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-black/10 shadow-lg overflow-hidden z-50"
                    onMouseEnter={() => setShowResources(true)}
                    onMouseLeave={() => setShowResources(false)}
                  >
                    {RESOURCES.map((r) => (
                      <a
                        key={r.file}
                        href={r.file}
                        target="_blank"
                        rel="noreferrer"
                        className="block px-4 py-3 text-sm hover:bg-gray-100 transition"
                      >
                        {r.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <NotificationBell
                onNavigate={(n) => {
                  const link = n.link || "";

                  if (link.startsWith("/new-owner-accept-transfer")) {
                    try {
                      const url = new URL("http://dummy" + link);
                      const tokenParam = url.searchParams.get("token");
                      if (tokenParam) {
                        openAcceptInsideDashboard({ acceptToken: tokenParam, transferId: null });
                      } else {
                        openIncomingTransfersList();
                      }
                    } catch (e) {
                      console.error(e);
                      openIncomingTransfersList();
                    }
                    return;
                  }

                  if (link.includes("tab=approved") || link.includes("land-search")) {
                    setActiveTab("verifyLandPage");
                    return;
                  }
                  if (link.includes("tab=pending") || link.includes("owner-requests")) {
                    setActiveTab("owner-requests");
                    return;
                  }
                }}
              />

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-black/10">
                <div className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#4e342e]" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-gray-900">{userInfo.name}</p>
                  <p className="text-xs text-gray-600">{userInfo.roleLabel}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-[#4e342e] hover:bg-[#3d2a24] transition text-sm font-semibold text-white"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Page header row */}
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold text-[#4e342e] truncate">
                {page.title}
              </h2>
              <p className="text-sm text-gray-600">{page.sub}</p>
            </div>

            <div className="hidden md:block">
              <Pill>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Secure session active
              </Pill>
            </div>
          </div>
        </Surface>
      </div>

      {/* Body */}
      <div className="h-[calc(100vh-120px)] px-6 pb-6 pt-4 flex gap-4">
        {/* Sidebar */}
        <Surface className="w-64 shrink-0 p-4">
          <LayoutGroup id="sidebar-tabs">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;

                return (
                  <motion.button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    layout
                    className={cn(
                      "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition font-semibold overflow-hidden",
                      active
                        ? "text-[#4cbb31] border-black/10 hover:bg-[#f3eeeb]"
                        : "bg-[#4e342e] text-white border-[#4e342e]"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-xl bg-white"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}

                    <Icon className="relative z-10 w-5 h-5 shrink-0" />
                    <span className="relative z-10 truncate">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
        </Surface>

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-4">

            {/* Dashboard home */}
            {activeTab === "dashboard" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Properties Owned" value="3" hint="Total titles under your account" />

                  <button
                    type="button"
                    onClick={openIncomingTransfersList}
                    className="text-left"
                    title="View pending transfers that need your confirmation"
                  >
                    <StatCard
                      title="Pending Transfers"
                      value={pendingTransfers}
                      hint="Click to review & accept"
                    />
                  </button>

                  <StatCard title="Verified Titles" value="12" hint="Verified in the system" />
                </div>

                <Surface className="p-6">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#4e342e]">Quick Actions</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Start common actions faster — same flow, cleaner UI.
                      </p>
                    </div>
                    <Pill>
                      <ShieldCheck className="w-4 h-4 text-[#4e342e]" />
                      Audit-friendly workflows
                    </Pill>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab("verifyLandPage")}
                      className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
                    >
                      <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
                        Search Land
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Apply for a search request.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("transfer")}
                      className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
                    >
                      <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
                        Transfer Ownership
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Invite the new owner to confirm.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("properties")}
                      className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
                    >
                      <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
                        My Properties
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </p>
                      <p className="text-sm text-gray-600 mt-1">View and manage your titles.</p>
                    </button>
                  </div>
                </Surface>
              </>
            )}

            {/* Pending Transfers */}
            {activeTab === "incoming-transfers" && (
              <Surface className="p-0">
                {transferView.mode === "list" ? (
                  <IncomingTransfersList
                    onSelect={(t) =>
                      openAcceptInsideDashboard({
                        transferId: t.id,
                        acceptToken: null,
                      })
                    }
                  />
                ) : (
                  <NewOwnerAcceptTransfer
                    acceptToken={transferView.acceptToken}
                    transferId={transferView.transferId}
                    onBack={openIncomingTransfersList}
                  />
                )}
              </Surface>
            )}

            {/* Pages */}
            {activeTab === "verifyLandPage" && (
              <Surface className="p-4">
                <ApplyLandSearch showNotification={showNotification} />
              </Surface>
            )}

            {activeTab === "transfer" && (
              <Surface className="p-4">
                <TransferOwnership showNotification={showNotification} />
              </Surface>
            )}

            {activeTab === "properties" && (
              <Surface className="p-4">
                <MyProperties showNotification={showNotification} />
              </Surface>
            )}

            {activeTab === "owner-requests" && (
              <Surface className="p-4">
                <OwnerSearchRequests showNotification={showNotification} />
              </Surface>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {notification && (
        <div
          className={cn(
            "fixed left-1/2 bottom-8 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-50 transition-all duration-300",
            showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            "bg-green-600 text-white"
          )}
        >
          {notification}
        </div>
      )}
    </div>
  );
}
