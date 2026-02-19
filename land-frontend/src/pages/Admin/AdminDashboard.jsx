// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";

import OwnerSearchRequests from "../landSearch/OwnerSearchRequests";
import AdminTransferRequests from "./AdminTransferRequests";
import LandsPage from "./LandsPage";
import UsersPage from "./UsersPage";

import {
  User,
  LayoutDashboard,
  ClipboardCheck,
  Repeat2,
  Building2,
  Users,
  LogOut,
} from "lucide-react";

/* -----------------------------
   Helpers
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

function getAdminInfo() {
  const token = localStorage.getItem("token");
  const payload = decodeJwtPayload(token);

  const email =
    localStorage.getItem("user_email") ||
    payload?.email ||
    payload?.username ||
    "admin";

  const name =
    localStorage.getItem("full_name") ||
    localStorage.getItem("name") ||
    payload?.full_name ||
    payload?.name ||
    email;

  return {
    name,
    roleLabel: "Admin",
  };
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

const BRAND = {
  brown: "#4e342e",
  brownDark: "#3b2823",
  cream: "#f7f4f2",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [adminInfo, setAdminInfo] = useState(() => getAdminInfo());

  useEffect(() => {
    setAdminInfo(getAdminInfo());
  }, []);

  // toast
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

  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return "Admin Overview";
      case "transfer-approvals":
        return "Transfer Approvals";
      case "search-approvals":
        return "Search Approvals";
      case "lands":
        return "All Lands";
      case "users":
        return "All Users";
      default:
        return "Admin Overview";
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "transfer-approvals", label: "Transfer Approvals", icon: Repeat2 },
    { key: "search-approvals", label: "Search Approvals", icon: ClipboardCheck },
    { key: "lands", label: "Lands", icon: Building2 },
    { key: "users", label: "Users", icon: Users },
  ];

  return (
    <div
      className="h-screen w-full flex"
      style={{
        background: `radial-gradient(1200px 600px at 10% 0%, rgba(78,52,46,0.10), transparent 55%),
                     radial-gradient(900px 500px at 90% 15%, rgba(34,197,94,0.10), transparent 55%),
                     linear-gradient(180deg, #ffffff 0%, ${BRAND.cream} 100%)`,
      }}
    >
      {/* Sidebar */}
      <aside
        className="w-72 shrink-0 h-screen sticky top-0 border-r"
        style={{
          background: `linear-gradient(180deg, ${BRAND.brown} 0%, ${BRAND.brownDark} 100%)`,
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-white font-black text-lg">LG</span>
            </div>
            <div className="leading-tight">
              <div className="text-white font-extrabold text-xl">LandGuard</div>
              <div className="text-white/70 text-xs">Admin Console</div>
            </div>
          </div>

          {/* Admin pill */}
          <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{adminInfo.name}</p>
                <p className="text-white/70 text-xs">{adminInfo.roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="mt-6">
            <p className="text-white/60 text-xs font-semibold tracking-wide mb-3">MENU</p>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={classNames(
                      "w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition",
                      active ? "bg-white text-[#4e342e]" : "text-white/90 hover:bg-white/10"
                    )}
                  >
                    <Icon className={classNames("w-5 h-5", active ? "text-[#4e342e]" : "text-white/80")} />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white transition"
          >
            <LogOut className="w-5 h-5 text-white/90" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-screen flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-6 py-4">
          <div className="bg-white/80 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-[#4e342e] truncate">{pageTitle}</h1>
              <p className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">Admin</span>.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell
                onNavigate={(n) => {
                  const link = n.link || "";
                  if (link.includes("transfer")) setActiveTab("transfer-approvals");
                  if (link.includes("owner-requests") || link.includes("search")) setActiveTab("search-approvals");
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-extrabold text-[#4e342e]">Quick Actions</h2>
                  <p className="text-sm text-gray-600 mt-1">Review pending workflows and manage records.</p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab("transfer-approvals")}
                      className="rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 text-left transition"
                    >
                      <p className="font-bold text-[#4e342e]">Transfer Approvals</p>
                      <p className="text-sm text-gray-600 mt-1">Approve or reject pending transfers.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("search-approvals")}
                      className="rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 text-left transition"
                    >
                      <p className="font-bold text-[#4e342e]">Search Approvals</p>
                      <p className="text-sm text-gray-600 mt-1">Review land search requests.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("lands")}
                      className="rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 text-left transition"
                    >
                      <p className="font-bold text-[#4e342e]">Lands</p>
                      <p className="text-sm text-gray-600 mt-1">View all land records.</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transfer-approvals" && (
              <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-4">
                <AdminTransferRequests />
              </div>
            )}

            {activeTab === "search-approvals" && (
              <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-4">
                <OwnerSearchRequests showNotification={showNotification} />
              </div>
            )}

            {activeTab === "lands" && (
              <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-4">
                <LandsPage />
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-4">
                <UsersPage />
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {notification && (
          <div
            className={classNames(
              "fixed left-1/2 bottom-10 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg z-50 transition-all duration-300",
              showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              "bg-green-600 text-white"
            )}
          >
            {notification}
          </div>
        )}
      </main>
    </div>
  );
}
