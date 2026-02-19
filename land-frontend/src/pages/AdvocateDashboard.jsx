// AdvocateDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { LayoutGroup, motion } from "framer-motion";

import ApplyLandSearch from "./landSearch/ApplyLandSearch"; // can reuse for "Official Search" (court order etc.)
import TransferOwnership from "./TransferOwnership"; // can reuse but advocate types should be enabled by backend/role
import "../styles/dashboard.css";

import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  Repeat2,
  FolderKanban,
  FileText,
  User,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  Filter,
  Gavel,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

/* -----------------------------
   Helpers (same as user dashboard)
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

/* -----------------------------
   Advocate-only UI helpers
------------------------------ */
const STATUS_META = {
  PENDING_NEW_OWNER_CONFIRMATION: {
    label: "Waiting New Owner",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: AlertTriangle,
  },
  PENDING_ADMIN_APPROVAL: {
    label: "Pending Admin",
    cls: "bg-blue-50 text-blue-800 border-blue-200",
    Icon: FileText,
  },
  NEEDS_CORRECTION: {
    label: "Needs Correction",
    cls: "bg-red-50 text-red-800 border-red-200",
    Icon: XCircle,
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-green-50 text-green-800 border-green-200",
    Icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
    Icon: XCircle,
  },
};

function StatusChip({ status }) {
  const m = STATUS_META[status] || {
    label: status || "Unknown",
    cls: "bg-zinc-50 text-zinc-700 border-zinc-200",
    Icon: FolderKanban,
  };
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs border px-2 py-1 rounded-full ${m.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
}

function pretty(s) {
  return String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function filenameFromUrl(u) {
  if (!u) return "document";
  try {
    return String(u).split("/").pop() || "document";
  } catch {
    return "document";
  }
}

async function fetchJson(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Request failed.");
  return data;
}

/* -----------------------------
   Main Advocate Dashboard
------------------------------ */
export default function AdvocateDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(() => getCurrentUserInfo());

  // Resources dropdown (same topbar UX as user dashboard)
  const [showResources, setShowResources] = useState(false);
  const RESOURCES = [
    { label: "Court Order Template (PDF)", file: "/forms/court-order-template.pdf" },
    { label: "Grant / Succession Checklist", file: "/forms/succession-checklist.pdf" },
    { label: "Transfer Instructions", file: "/forms/transfer-guide.pdf" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    localStorage.removeItem("name");
    navigate("/");
  };

  useEffect(() => {
    setUserInfo(getCurrentUserInfo());
    // if not advocate, bounce to normal dashboard
    const r = (localStorage.getItem("role") || "").toUpperCase();
    if (r && r !== "ADVOCATE" && r !== "ADMIN") navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page = useMemo(() => {
    const map = {
        dashboard: { title: "Advocate Dashboard", sub: "Case overview, official searches, and client transfers." },
        "official-search": { title: "Official Land Search", sub: "Submit court/official search requests and track progress." },
        "client-transfer": { title: "Client Transfers", sub: "Initiate inheritance/court order transfers on behalf of clients." },
        cases: { title: "Case Queue", sub: "Manage active cases, documents, and admin feedback." },
        documents: { title: "Document Center", sub: "Quick access to uploaded case documents." },
        profile: { title: "Profile", sub: "Advocate identity & compliance details (license, firm, verification)." },
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
      {/* Top Bar (same structure as user dashboard) */}
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
                  <h1 className="text-lg font-extrabold text-[#4e342e] truncate">LandGuard</h1>
                  <Pill>
                    <Sparkles className="w-3.5 h-3.5" />
                    Advocate Mode
                  </Pill>
                </div>
                <p className="text-xs text-gray-600 truncate">Secure land verification & transfer</p>
              </div>
            </div>

            {/* Right actions */}
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

              <NotificationBell
                onNavigate={() => {
                  // advocates can later route notifications to "cases" tab, etc.
                  setActiveTab("cases");
                }}
              />

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
            {/* Advocate home */}
            {activeTab === "dashboard" && <AdvocateHome onGo={setActiveTab} />}

            {/* Official searches (court/official) */}
            {activeTab === "official-search" && (
              <Surface className="p-4">
                {/* Reuse ApplyLandSearch for now; later add fields like "court file no", "order ref", etc. */}
                <ApplyLandSearch
                  showNotification={() => {}}
                  // optional: you can pass a prop to render advocate-only fields if you add it inside ApplyLandSearch
                  // mode="advocate"
                />
              </Surface>
            )}

            {/* Client transfers (inheritance/court order) */}
            {activeTab === "client-transfer" && (
              <Surface className="p-4">
                {/* Reuse TransferOwnership for now.
                    Your backend already enforces advocate-only types (inheritance/court_order). */}
                <TransferOwnership
                  showNotification={() => {}}
                  // optional: pass mode so UI can default to advocate transfer types
                  // mode="advocate"
                />
              </Surface>
            )}

            {/* Case queue */}
            {activeTab === "cases" && (
              <Surface className="p-4">
                <AdvocateCaseQueue />
              </Surface>
            )}

            {/* Document center */}
            {activeTab === "documents" && (
              <Surface className="p-4">
                <AdvocateDocumentCenter />
              </Surface>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <Surface className="p-6">
                <AdvocateProfileCard userInfo={userInfo} />
              </Surface>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Advocate Home (creative + useful)
------------------------------ */
function AdvocateHome({ onGo }) {
  // Placeholder stats (wire to backend later)
  const stats = {
    openCases: 6,
    waitingNewOwner: 2,
    pendingAdmin: 3,
    needsCorrection: 1,
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Open Cases" value={stats.openCases} hint="Active matters in progress" />
        <button type="button" onClick={() => onGo("cases")} className="text-left">
          <StatCard title="Waiting New Owner" value={stats.waitingNewOwner} hint="Invites pending acceptance" />
        </button>
        <button type="button" onClick={() => onGo("cases")} className="text-left">
          <StatCard title="Pending Admin" value={stats.pendingAdmin} hint="Ready for registry review" />
        </button>
        <button type="button" onClick={() => onGo("cases")} className="text-left">
          <StatCard title="Needs Correction" value={stats.needsCorrection} hint="Fix issues & resubmit" />
        </button>
      </div>

      <Surface className="p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#4e342e]">Advocate Quick Actions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Official search requests and client transfers — designed for legal workflows.
            </p>
          </div>
          <Pill>
            <Gavel className="w-4 h-4 text-[#4e342e]" />
            Court-ready case files
          </Pill>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onGo("official-search")}
            className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
          >
            <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
              Official Land Search
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Submit searches backed by court order / official request.
            </p>
          </button>

          <button
            onClick={() => onGo("client-transfer")}
            className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
          >
            <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
              Initiate Client Transfer
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Inheritance / Court order transfer with required legal documents.
            </p>
          </button>

          <button
            onClick={() => onGo("cases")}
            className="group text-left rounded-2xl border border-black/10 bg-[#f7f4f2] hover:bg-[#f2edea] p-4 transition"
          >
            <p className="font-extrabold text-[#4e342e] flex items-center justify-between">
              Case Queue
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Track status, upload missing docs, and respond to admin corrections.
            </p>
          </button>
        </div>
      </Surface>
    </>
  );
}

/* -----------------------------
   Case Queue (list + detail split)
   Expected endpoints (when you wire backend):
   - GET  /transfer/advocate/cases
   - GET  /transfer/{id}/detail
   - GET  /transfer/docs/{doc_id}
------------------------------ */
function AdvocateCaseQueue() {
  const API = "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [ttype, setTtype] = useState("ALL");

  const [selectedId, setSelectedId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMsg, setDetailMsg] = useState("");
  const [detail, setDetail] = useState(null);

  const [docBusy, setDocBusy] = useState(null);

  const load = async () => {
    if (!token) return setMsg("Please log in.");
    setLoading(true);
    setMsg("");
    try {
      const data = await fetchJson(`${API}/transfer/advocate/cases`, token);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMsg(e.message || "Failed to load cases. Create /transfer/advocate/cases endpoint.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!token) return;
    setSelectedId(id);
    setDetailLoading(true);
    setDetailMsg("");
    setDetail(null);
    try {
      const data = await fetchJson(`${API}/transfer/${encodeURIComponent(id)}/detail`, token);
      setDetail(data);
    } catch (e) {
      console.error(e);
      setDetailMsg(e.message || "Failed to load case detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((c) => {
      const okStatus = status === "ALL" ? true : c.status === status;
      const okType = ttype === "ALL" ? true : c.transfer_type === ttype;

      const hay = [
        c.reference_no,
        c.land_title_number,
        c.transfer_type,
        c.status,
        c.primary_party,
        c.client_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const okQ = query ? hay.includes(query) : true;
      return okStatus && okType && okQ;
    });
  }, [items, q, status, ttype]);

  const openDoc = async (downloadUrl, name = "document") => {
    if (!token) return;
    if (!downloadUrl) return;

    setDocBusy(name);
    setDetailMsg("");
    try {
      const res = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        let err = "Failed to open document.";
        try {
          const d = await res.json();
          err = d?.detail || err;
        } catch {}
        setDetailMsg(err);
        return;
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const w = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      console.error(e);
      setDetailMsg("Server error opening document.");
    } finally {
      setDocBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold text-[#4e342e]">Work Queue</h3>
          <p className="text-sm text-gray-600 mt-1">
            Cases you initiated for clients (inheritance & court order).
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {msg && <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">{msg}</div>}

      {/* Filters */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref, title number, party name…"
            className="w-full border rounded-lg pl-10 pr-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border">
            <Filter className="w-4 h-4 text-gray-700" />
            <select className="bg-transparent text-sm outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PENDING_NEW_OWNER_CONFIRMATION">Waiting New Owner</option>
              <option value="PENDING_ADMIN_APPROVAL">Pending Admin</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border">
            <Gavel className="w-4 h-4 text-gray-700" />
            <select className="bg-transparent text-sm outline-none" value={ttype} onChange={(e) => setTtype(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="inheritance">Inheritance</option>
              <option value="court_order">Court Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-700 py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading cases…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">
              No cases match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => loadDetail(c.id)}
                  className={`w-full text-left p-4 rounded-xl border transition hover:bg-gray-50 ${
                    selectedId === c.id ? "border-[#4e342e] bg-[#4e342e]/5" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#4e342e] truncate">
                        Ref: {c.reference_no || `#${c.id}`}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Title: {c.land_title_number || "N/A"} • Type: {pretty(c.transfer_type || "N/A")}
                      </p>
                      {!!c.primary_party && (
                        <p className="text-xs text-gray-600 mt-1 truncate">Party: {c.primary_party}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusChip status={c.status} />
                      {typeof c.docs_uploaded === "number" && typeof c.docs_required === "number" && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${
                            c.docs_uploaded >= c.docs_required
                              ? "bg-green-50 text-green-800 border-green-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          Docs: {c.docs_uploaded}/{c.docs_required}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          {!selectedId && (
            <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">
              Select a case to view its details and documents.
            </div>
          )}

          {detailMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-3">
              {detailMsg}
            </div>
          )}

          {detailLoading && (
            <div className="flex items-center gap-2 text-gray-700 py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading details…
            </div>
          )}

          {detail && (
            <div className="space-y-4">
              <div className="border rounded-xl p-4">
                <p className="font-semibold text-[#4e342e]">
                  Ref: {detail.reference_no || "N/A"}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Title: {detail.land_title_number || "N/A"} • Type: {pretty(detail.transfer_type || "N/A")}
                </p>
                <div className="mt-2">
                  <StatusChip status={detail.status} />
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-semibold text-[#4e342e] mb-2">Documents</p>

                {Array.isArray(detail.documents) && detail.documents.length > 0 ? (
                  <div className="space-y-2">
                    {detail.documents.map((d) => {
                      const name = d.filename || filenameFromUrl(d.file_url);
                      const label = pretty(d.document_type || "document");
                      const url = d.download_url || d.downloadUrl || d.url;
                      const busy = docBusy === name;

                      return (
                        <div
                          key={d.id ?? `${d.document_type}-${name}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 border"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{label}</p>
                            <p className="text-xs text-gray-600 break-all">{name}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openDoc(url, name)}
                            disabled={!url || busy}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4e342e] text-white text-sm disabled:opacity-60"
                            title={!url ? "Backend did not provide download_url" : "Open"}
                          >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {busy ? "Opening…" : "View"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">
                    No documents uploaded yet.
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-semibold text-[#4e342e] mb-2">Next Actions</p>
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-700" />
                    Upload missing documents if any, then submit for admin review.
                  </p>
                  <p className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-blue-700" />
                    If admin requests correction, update details and re-submit.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Note: If you haven’t implemented advocate endpoints yet, the case queue will show an error until they exist.
      </p>
    </div>
  );
}

/* -----------------------------
   Document Center (simple, creative)
   - Shows recently accessed docs from localStorage for now
   - Later wire to backend: GET /transfer/advocate/documents
------------------------------ */
function AdvocateDocumentCenter() {
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem("adv_recent_docs");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(0, 12) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold text-[#4e342e]">Document Center</h3>
          <p className="text-sm text-gray-600 mt-1">
            Quick access to recently viewed case documents (placeholder until backend endpoint).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("adv_recent_docs");
            setRecent([]);
          }}
          className="px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-gray-50 text-sm font-semibold"
        >
          Clear
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">
          No recent documents yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recent.map((d, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-black/10">
              <p className="font-semibold text-[#4e342e]">{pretty(d.document_type || "Document")}</p>
              <p className="text-xs text-gray-600 mt-1 break-all">{d.filename || d.file_url || "N/A"}</p>
              <p className="text-xs text-gray-500 mt-2">Case: {d.reference_no || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   Advocate Profile Card (creative)
   - Pulls what we can from storage/JWT
   - Later wire to /auth/me to show license details
------------------------------ */
function AdvocateProfileCard({ userInfo }) {
  const token = localStorage.getItem("token");
  const payload = decodeJwtPayload(token);

  const email = payload?.email || payload?.username || "—";
  const license = payload?.advocate_license_no || payload?.license_no || "—";
  const firm = payload?.firm_name || payload?.org_name || "—";
  const verified = payload?.verified ?? payload?.is_verified ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold text-[#4e342e]">Advocate Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Identity and compliance overview.</p>
        </div>
        <Pill>
          <ShieldCheck className="w-4 h-4 text-[#4e342e]" />
          Role: ADVOCATE
        </Pill>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-black/10">
          <p className="text-xs text-gray-500">Name</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{userInfo.name}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-black/10">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{email}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-black/10">
          <p className="text-xs text-gray-500">License No.</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{license}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-black/10">
          <p className="text-xs text-gray-500">Firm</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{firm}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-black/10">
        <p className="text-xs text-gray-500">Verification Status</p>
        <p className="mt-1 text-sm font-bold">
          {verified === null ? (
            <span className="text-gray-700">Not Provided</span>
          ) : verified ? (
            <span className="text-green-700">Verified</span>
          ) : (
            <span className="text-amber-700">Pending Verification</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Tip: You can later enforce verified advocates only for court-order transfers.
        </p>
      </div>
    </div>
  );
}
