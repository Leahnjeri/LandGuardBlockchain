// src/pages/advocates/OfficialSearch.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Gavel,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Search,
  Download,
  Info,
} from "lucide-react";
import { Surface, Pill, cn } from "./ui";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const getToken = () => localStorage.getItem("token"); // adjust if you store token elsewhere

function StatusChip({ status }) {
  const map = {
    SUBMITTED: { cls: "bg-blue-50 text-blue-800 border-blue-200", Icon: FileText, label: "Submitted" },
    NEEDS_CORRECTION: { cls: "bg-amber-50 text-amber-800 border-amber-200", Icon: AlertTriangle, label: "Needs Correction" },
    COMPLETED: { cls: "bg-green-50 text-green-800 border-green-200", Icon: CheckCircle, label: "Completed" },
    REJECTED: { cls: "bg-red-50 text-red-800 border-red-200", Icon: XCircle, label: "Rejected" },
  };
  const m = map[status] || { cls: "bg-zinc-50 text-zinc-700 border-zinc-200", Icon: Info, label: status || "Unknown" };
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs border px-2 py-1 rounded-full ${m.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
}

function FilePicker({ label, hint, required, onChange, valueName }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-[#4e342e] text-sm">
            {label} {required ? <span className="text-red-600">*</span> : null}
          </p>
          {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
        </div>
        <UploadCloud className="w-5 h-5 text-[#4e342e]" />
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-[#4e342e] text-white text-sm font-semibold cursor-pointer hover:bg-[#3d2a24] transition">
          <UploadCloud className="w-4 h-4" />
          Choose file
          <input type="file" className="hidden" onChange={onChange} />
        </label>

        <span className="text-xs text-gray-700 break-all">
          {valueName ? `Selected: ${valueName}` : "No file selected"}
        </span>
      </div>
    </div>
  );
}

export default function OfficialSearch() {
  const [tab, setTab] = useState("create"); // create | mine

  const [form, setForm] = useState({
    titleNumber: "",
    county: "",
    basis: "CLIENT_INSTRUCTION", // CLIENT_INSTRUCTION | COURT_ORDER
    matterRef: "",
    reason: "",
  });

  const [files, setFiles] = useState({
    authorityLetter: null,
    courtOrder: null,
    paymentReceipt: null,
    supporting: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const [q, setQ] = useState("");
  const [requests, setRequests] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const requiredOk = useMemo(() => {
    if (!form.titleNumber.trim()) return false;
    if (!form.matterRef.trim()) return false;
    if (!form.reason.trim()) return false;

    if (form.basis === "CLIENT_INSTRUCTION") return !!files.authorityLetter;
    if (form.basis === "COURT_ORDER") return !!files.courtOrder;
    return true;
  }, [form, files]);

  const submitToBackend = async () => {
    setMsg("");

    if (!requiredOk) {
      setMsg("Please fill required fields and attach the required document for the chosen basis.");
      return;
    }

    const token = getToken();
    if (!token) {
      setMsg("You are not logged in. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      // Backend expects snake_case fields
      fd.append("title_number", form.titleNumber.trim());
      fd.append("county", (form.county || "").trim());
      fd.append("basis", form.basis);
      fd.append("matter_ref", form.matterRef.trim());
      fd.append("reason", form.reason.trim());

      // Backend expects these file field names (camelCase)
      if (files.authorityLetter) fd.append("authorityLetter", files.authorityLetter);
      if (files.courtOrder) fd.append("courtOrder", files.courtOrder);
      if (files.paymentReceipt) fd.append("paymentReceipt", files.paymentReceipt);
      if (files.supporting) fd.append("supporting", files.supporting);

      const res = await fetch(`${API_BASE}/official-search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Failed to submit request");

      setMsg(`✅ Submitted. Ref: ${data.ref || "Created"}`);
      setTab("mine");

      // Optional: clear form after submit
      setForm({
        titleNumber: "",
        county: "",
        basis: "CLIENT_INSTRUCTION",
        matterRef: "",
        reason: "",
      });
      setFiles({
        authorityLetter: null,
        courtOrder: null,
        paymentReceipt: null,
        supporting: null,
      });
    } catch (e) {
      setMsg(e?.message || "Server error submitting request.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMine = async () => {
    const token = getToken();
    if (!token) {
      setMsg("You are not logged in. Please log in again.");
      return;
    }

    setLoadingMine(true);
    try {
      const res = await fetch(`${API_BASE}/official-search/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Failed to load requests");
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg(e?.message || "Failed to load requests.");
      setRequests([]);
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    if (tab === "mine") loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const downloadResult = async (id, ref) => {
    setMsg("");
    const token = getToken();
    if (!token) {
      setMsg("You are not logged in. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/official-search/${id}/result`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Result not available yet.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${ref || "official-search-result"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      setMsg(e?.message || "Failed to download result.");
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = requests || [];
    if (!s) return list;

    return list.filter((r) => {
      const ref = String(r.ref || "");
      const title = String(r.title_number || "");
      return (ref + " " + title).toLowerCase().includes(s);
    });
  }, [q, requests]);

  const formatDate = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
      return dt.toISOString().slice(0, 10);
    } catch {
      return String(d).slice(0, 10);
    }
  };

  return (
    <div className="space-y-4 pb-32">
      <Surface className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-[#4e342e] flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Official Land Search
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sent to <span className="font-semibold">Admin/Registry</span> for processing. Owner is
              <span className="font-semibold"> notified (FYI)</span> — no approval step.
            </p>
          </div>

          <Pill>
            <Info className="w-4 h-4 text-[#4e342e]" />
            Admin workflow
          </Pill>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setTab("create")}
            className={cn(
              "px-4 py-2 rounded-xl border text-sm font-semibold transition",
              tab === "create" ? "bg-[#4e342e] text-white border-[#4e342e]" : "bg-white border-black/10 hover:bg-gray-50"
            )}
          >
            Create Request
          </button>
          <button
            onClick={() => setTab("mine")}
            className={cn(
              "px-4 py-2 rounded-xl border text-sm font-semibold transition",
              tab === "mine" ? "bg-[#4e342e] text-white border-[#4e342e]" : "bg-white border-black/10 hover:bg-gray-50"
            )}
          >
            My Requests
          </button>
        </div>
      </Surface>

      {msg && (
        <div
          className={cn(
            "p-4 rounded-xl border",
            msg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          {msg}
        </div>
      )}

      {tab === "create" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Surface className="p-5 space-y-4">
              <div>
                <p className="font-extrabold text-[#4e342e]">Request Details</p>
                <p className="text-sm text-gray-600 mt-1">Parcel details + legal basis.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-[#4e342e]">
                    Title Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="mt-1 w-full border p-3 rounded-xl"
                    placeholder="e.g., NAIROBI/BLOCK/123"
                    value={form.titleNumber}
                    onChange={(e) => setForm((p) => ({ ...p, titleNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#4e342e]">County / Registry</label>
                  <input
                    className="mt-1 w-full border p-3 rounded-xl"
                    placeholder="e.g., Nairobi"
                    value={form.county}
                    onChange={(e) => setForm((p) => ({ ...p, county: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#4e342e]">
                  Search Basis <span className="text-red-600">*</span>
                </label>
                <select
                  className="mt-1 w-full border p-3 rounded-xl bg-white"
                  value={form.basis}
                  onChange={(e) => setForm((p) => ({ ...p, basis: e.target.value }))}
                >
                  <option value="CLIENT_INSTRUCTION">Client Instruction (Letter of Authority)</option>
                  <option value="COURT_ORDER">Court Order</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Required document changes based on basis.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#4e342e]">
                  Matter Reference <span className="text-red-600">*</span>
                </label>
                <input
                  className="mt-1 w-full border p-3 rounded-xl"
                  placeholder="Court case no / Succession cause / Firm file no"
                  value={form.matterRef}
                  onChange={(e) => setForm((p) => ({ ...p, matterRef: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#4e342e]">
                  Reason / Grounds <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="mt-1 w-full border p-3 rounded-xl min-h-[110px]"
                  placeholder="Explain why the official search is required..."
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                />
              </div>

              <button
                onClick={submitToBackend}
                disabled={submitting || !requiredOk}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4e342e] text-white font-semibold disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Submit
              </button>

              <p className="text-xs text-gray-500">
                After submission: Admin processes → uploads official result → download from “My Requests”.
              </p>
            </Surface>

            <div className="space-y-4">
              <Surface className="p-5">
                <p className="font-extrabold text-[#4e342e]">Supporting Documents</p>
                <p className="text-sm text-gray-600 mt-1">Attach legal authority for the search. Owner is notified (FYI).</p>

                <div className="mt-4 space-y-3">
                  {form.basis === "CLIENT_INSTRUCTION" ? (
                    <FilePicker
                      label="Letter of Authority / Client Instruction"
                      hint="Signed client instruction letter authorizing the official search."
                      required
                      valueName={files.authorityLetter?.name}
                      onChange={(e) => setFiles((p) => ({ ...p, authorityLetter: e.target.files?.[0] || null }))}
                    />
                  ) : (
                    <FilePicker
                      label="Court Order"
                      hint="Attach the court order authorizing the official search."
                      required
                      valueName={files.courtOrder?.name}
                      onChange={(e) => setFiles((p) => ({ ...p, courtOrder: e.target.files?.[0] || null }))}
                    />
                  )}

                  <FilePicker
                    label="Payment Receipt (optional)"
                    hint="Attach receipt if search fee was paid externally."
                    required={false}
                    valueName={files.paymentReceipt?.name}
                    onChange={(e) => setFiles((p) => ({ ...p, paymentReceipt: e.target.files?.[0] || null }))}
                  />

                  <FilePicker
                    label="Additional Supporting Document (optional)"
                    hint="Affidavit/extract/previous search copy etc."
                    required={false}
                    valueName={files.supporting?.name}
                    onChange={(e) => setFiles((p) => ({ ...p, supporting: e.target.files?.[0] || null }))}
                  />
                </div>
              </Surface>

              <Surface className="p-5">
                <p className="font-extrabold text-[#4e342e]">What happens next?</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-blue-700" />
                    <p>
                      <span className="font-semibold">Admin receives</span> and verifies documents.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-700" />
                    <p>
                      Status becomes <span className="font-semibold">Needs Correction</span> if missing docs.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-700" />
                    <p>
                      Admin uploads the <span className="font-semibold">Official Search Result</span>.
                    </p>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </>
      )}

      {tab === "mine" && (
        <Surface className="p-5">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="font-extrabold text-[#4e342e]">My Official Search Requests</p>
              <p className="text-sm text-gray-600 mt-1">Track status and download results.</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search ref or title number…"
                  className="w-full border rounded-xl pl-10 pr-3 py-2"
                />
              </div>

              <button
                onClick={loadMine}
                disabled={loadingMine}
                className="px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                {loadingMine ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loadingMine && requests.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-50 border text-zinc-700 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : null}

            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-extrabold text-[#4e342e] truncate">{r.ref}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Title: {r.title_number} • Basis: {r.basis === "COURT_ORDER" ? "Court Order" : "Client Instruction"} •
                      Date: {formatDate(r.created_at)}
                    </p>

                    {r.admin_notes ? (
                      <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                        <p className="font-semibold">Admin note:</p>
                        <p className="mt-1">{r.admin_notes}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusChip status={r.status} />
                    {r.status === "COMPLETED" ? (
                      <button
                        onClick={() => downloadResult(r.id, r.ref)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#4e342e] text-white text-sm font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        Result
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {!loadingMine && filtered.length === 0 && (
              <div className="p-4 rounded-xl bg-zinc-50 border text-zinc-700">No requests found.</div>
            )}
          </div>
        </Surface>
      )}
    </div>
  );
}
