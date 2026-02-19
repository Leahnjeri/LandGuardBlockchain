// src/pages/advocates/CaseQueue.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Filter,
  Gavel,
  Loader2,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  FolderKanban,
} from "lucide-react";
import { Surface } from "./ui";

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
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Request failed.");
  return data;
}

const STATUS_META = {
  PENDING_NEW_OWNER_CONFIRMATION: { label: "Waiting New Owner", cls: "bg-amber-50 text-amber-800 border-amber-200", Icon: AlertTriangle },
  PENDING_ADMIN_APPROVAL: { label: "Pending Admin", cls: "bg-blue-50 text-blue-800 border-blue-200", Icon: FileText },
  NEEDS_CORRECTION: { label: "Needs Correction", cls: "bg-red-50 text-red-800 border-red-200", Icon: XCircle },
  APPROVED: { label: "Approved", cls: "bg-green-50 text-green-800 border-green-200", Icon: CheckCircle },
  REJECTED: { label: "Rejected", cls: "bg-zinc-100 text-zinc-700 border-zinc-200", Icon: XCircle },
};

function StatusChip({ status }) {
  const m = STATUS_META[status] || { label: status || "Unknown", cls: "bg-zinc-50 text-zinc-700 border-zinc-200", Icon: FolderKanban };
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs border px-2 py-1 rounded-full ${m.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
}

export default function CaseQueue() {
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
      setMsg(e.message || "Failed to load cases. Implement /transfer/advocate/cases.");
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
      setDetailMsg(e.message || "Failed to load case detail. Implement /transfer/{id}/detail.");
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
      const hay = [c.reference_no, c.land_title_number, c.transfer_type, c.status, c.primary_party, c.client_name]
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
          <h3 className="text-lg font-extrabold text-[#4e342e]">Case Queue</h3>
          <p className="text-sm text-gray-600 mt-1">Track inheritance & court order transfers initiated for clients.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {msg && <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">{msg}</div>}

      <Surface className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, title number, party…" className="w-full border rounded-lg pl-10 pr-3 py-2" />
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
      </Surface>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Surface className="p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-700 py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading cases…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">No cases match your filters.</div>
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
                      <p className="font-semibold text-[#4e342e] truncate">Ref: {c.reference_no || `#${c.id}`}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Title: {c.land_title_number || "N/A"} • Type: {pretty(c.transfer_type || "N/A")}
                      </p>
                      {!!c.primary_party && <p className="text-xs text-gray-600 mt-1 truncate">Party: {c.primary_party}</p>}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusChip status={c.status} />
                      {typeof c.docs_uploaded === "number" && typeof c.docs_required === "number" && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${
                            c.docs_uploaded >= c.docs_required ? "bg-green-50 text-green-800 border-green-200" : "bg-amber-50 text-amber-800 border-amber-200"
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
        </Surface>

        <Surface className="p-4">
          {!selectedId && <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">Select a case to view details.</div>}

          {detailMsg && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-3">{detailMsg}</div>}

          {detailLoading && (
            <div className="flex items-center gap-2 text-gray-700 py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading details…
            </div>
          )}

          {detail && (
            <div className="space-y-4">
              <div className="border rounded-xl p-4 bg-white">
                <p className="font-semibold text-[#4e342e]">Ref: {detail.reference_no || "N/A"}</p>
                <p className="text-sm text-gray-700 mt-1">
                  Title: {detail.land_title_number || "N/A"} • Type: {pretty(detail.transfer_type || "N/A")}
                </p>
                <div className="mt-2">
                  <StatusChip status={detail.status} />
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-white">
                <p className="font-semibold text-[#4e342e] mb-2">Documents</p>
                {Array.isArray(detail.documents) && detail.documents.length > 0 ? (
                  <div className="space-y-2">
                    {detail.documents.map((d) => {
                      const name = d.filename || filenameFromUrl(d.file_url);
                      const label = pretty(d.document_type || "document");
                      const url = d.download_url || d.downloadUrl || d.url;
                      const busy = docBusy === name;

                      return (
                        <div key={d.id ?? `${d.document_type}-${name}`} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 border">
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
                  <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">No documents uploaded yet.</div>
                )}
              </div>
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}
