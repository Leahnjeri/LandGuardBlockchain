// src/pages/advocates/AdvocateLayout.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import { LayoutGroup, motion } from "framer-motion";

import { BrandBlock, Pill, Surface, cn, getCurrentUserInfo } from "./ui";

import {
  LayoutDashboard,
  Search,
  Repeat2,
  FolderKanban,
  FileText,
  User,
  LogOut,
} from "lucide-react";

import AdvocateHome from "./AdvocateHome";
import OfficialSearch from "./OfficialSearch";
import ClientTransfers from "./ClientTransfers";
import CaseQueue from "./CaseQueue";
import DocumentCenter from "./DocumentCenter";
import AdvocateProfile from "./AdvocateProfile";

/**
 * This is the main /advocate page.
 * It uses the same topbar style as Dashboard.jsx for consistency,
 * but renders advocate-specific pages from separate files.
 */
export default function AdvocateLayout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(() => getCurrentUserInfo());

  // Resources dropdown
  const [showResources, setShowResources] = useState(false);
  const RESOURCES = [
    { label: "Court Order Template (PDF)", file: "/forms/court-order-template.pdf" },
    { label: "Succession Checklist", file: "/forms/succession-checklist.pdf" },
    { label: "Transfer Instructions", file: "/forms/transfer-guide.pdf" },
  ];

  // optional toast hook (reuse later)
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

  useEffect(() => {
    const info = getCurrentUserInfo();
    setUserInfo(info);

    const r = (info.role || "").toUpperCase();
    if (r && r !== "ADVOCATE" && r !== "ADMIN") navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page = useMemo(() => {
    const map = {
      dashboard: { title: "Advocate Dashboard", sub: "Case overview, official searches, and client transfers." },
      "official-search": { title: "Official Land Search", sub: "Submit official searches to Admin/Registry." },
      "client-transfer": { title: "Client Transfers", sub: "Initiate inheritance/court order transfers for clients." },
      cases: { title: "Case Queue", sub: "Track case status, documents, and admin feedback." },
      documents: { title: "Document Center", sub: "Quick access to case documents." },
      profile: { title: "Profile", sub: "Advocate identity & compliance details." },
    };
    return map[activeTab] || map.dashboard;
  }, [activeTab]);

  const navItems = [
    { key: "dashboard", label: "Home", icon: LayoutDashboard },
    { key: "official-search", label: "Official Search", icon: Search },
    { key: "client-transfer", label: "Client Transfers", icon: Repeat2 },
    { key: "cases", label: "Case Queue", icon: FolderKanban },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "profile", label: "Profile", icon: User },
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
      {/* Top Bar (same structure as Dashboard.jsx) */}
      <div className="sticky top-0 z-30 px-6 pt-6">
        <Surface className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <BrandBlock modeLabel="Advocate Mode" />

            <div className="flex items-center gap-4">
              {/* Resources Hover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowResources(true)}
                onMouseLeave={() => setTimeout(() => setShowResources(false), 120)}
              >
                <span className="cursor-pointer text-sm font-semibold text-[#4e342e] hover:underline">
                  Resources
                </span>

                {showResources && (
                  <div
                    className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-black/10 shadow-lg overflow-hidden z-50"
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

              <NotificationBell onNavigate={() => setActiveTab("cases")} />

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-black/10">
                <div className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#4e342e]" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-gray-900">{userInfo.name}</p>
                  <p className="text-xs text-gray-600">Advocate</p>
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
              <h2 className="text-2xl font-extrabold text-[#4e342e] truncate">{page.title}</h2>
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
          <LayoutGroup id="adv-sidebar-tabs">
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
                        layoutId="advActiveTabPill"
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
            {activeTab === "dashboard" && <AdvocateHome onGo={setActiveTab} />}
            {activeTab === "official-search" && <OfficialSearch />}
            {activeTab === "client-transfer" && <ClientTransfers showNotification={showNotification} />}
            {activeTab === "cases" && <CaseQueue />}
            {activeTab === "documents" && <DocumentCenter />}
            {activeTab === "profile" && <AdvocateProfile />}
          </div>
        </div>
      </div>

      {/* Toast (optional) */}
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
