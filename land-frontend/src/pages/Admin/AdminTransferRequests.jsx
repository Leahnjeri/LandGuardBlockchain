// src/pages/Admin/AdminTransferRequests.jsx
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, FileText, Loader2, RefreshCw, MessageSquareText } from "lucide-react";

const API = "http://localhost:8000";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function StatusPill({ status }) {
  const s = String(status || "").toUpperCase();

  const cls =
    s === "PENDING_ADMIN_APPROVAL"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : s === "APPROVED"
      ? "bg-green-100 text-green-800 border-green-200"
      : s === "REJECTED"
      ? "bg-red-100 text-red-800 border-red-200"
      : s === "NEEDS_CORRECTION"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border", cls)}>
      {s || "UNKNOWN"}
    </span>
  );
}

export default function AdminTransferRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [decision, setDecision] = useState("APPROVE");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pendingOnly = useMemo(
    () => requests.filter((r) => String(r.status || "").toUpperCase() === "PENDING_ADMIN_APPROVAL"),
    [requests]
  );

  const fetchRequests = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API}/transfer/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch transfers (${res.status})`);

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoadingList(false);
    }
  };

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setAdminNotes("");
    setDecision("APPROVE");
    setLoadingDetail(true);

    try {
      const res = await fetch(`${API}/transfer/admin/${id}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load detail (${res.status})`);

      const data = await res.json();
      setDetail(data);
      if (data?.admin_notes) setAdminNotes(String(data.admin_notes));
    } catch (err) {
      console.error(err);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setAdminNotes("");
    setDecision("APPROVE");
  };

  const submitDecision = async () => {
    if (!selectedId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/transfer/admin/${selectedId}/review`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
          admin_notes: adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Review failed:", data);
        alert(data?.detail || "Failed to submit decision");
        return;
      }

      // update list locally
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, status: data.status, admin_notes: data.admin_notes } : r))
      );

      closeDetail();
    } catch (err) {
      console.error(err);
      alert("Server error submitting decision");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#4e342e]">
            Transfer Approvals
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review documents and approve / reject / request correction.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-gray-50"
          disabled={loadingList}
        >
          {loadingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      <div className="mt-6 bg-white border border-black/10 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#4e342e]">Pending Admin Approval</p>
          <span className="text-sm text-gray-600">{pendingOnly.length} pending</span>
        </div>

        {loadingList ? (
          <div className="py-8 text-gray-600 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading transfers...
          </div>
        ) : pendingOnly.length === 0 ? (
          <p className="text-gray-600 mt-4">No transfers awaiting admin approval.</p>
        ) : (
          <div className="mt-4 divide-y">
            {pendingOnly.map((t) => (
              <button
                key={t.id}
                onClick={() => openDetail(t.id)}
                className="w-full text-left py-4 hover:bg-gray-50 rounded-xl px-3 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {t.reference_no || `Transfer #${t.id}`} • Land #{t.land_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: <span className="font-medium">{t.transfer_type}</span> • To:{" "}
                      <span className="font-medium">{t.transfer_to}</span> • Buyer ID:{" "}
                      <span className="font-medium">{t.buyer_id}</span>
                    </p>
                  </div>
                  <StatusPill status={t.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Review Transfer</p>
                <h2 className="text-xl font-extrabold text-[#4e342e] truncate">
                  {detail?.reference_no || `Transfer #${selectedId}`}
                </h2>
              </div>
              <button
                onClick={closeDetail}
                className="px-3 py-2 rounded-xl border border-black/10 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-auto">
              {loadingDetail ? (
                <div className="py-10 text-gray-600 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading details...
                </div>
              ) : !detail ? (
                <p className="text-gray-600">Failed to load transfer details.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <StatusPill status={detail.status} />
                    <p className="text-sm text-gray-600">
                      Created:{" "}
                      {detail.created_at ? new Date(detail.created_at).toLocaleString() : "-"}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-4">
                      <p className="text-xs text-gray-500">Land</p>
                      <p className="font-semibold">#{detail.land_id}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Title: {detail.land_title_number || "-"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Size: {detail.land_size ?? "-"}
                      </p>
                    </div>

                    <div className="border rounded-xl p-4">
                      <p className="text-xs text-gray-500">Seller</p>
                      <p className="font-semibold">{detail.seller?.name || "-"}</p>
                      <p className="text-sm text-gray-700 mt-1">{detail.seller?.email || "-"}</p>
                      <p className="text-sm text-gray-700">ID: {detail.seller?.id ?? "-"}</p>
                    </div>

                    <div className="border rounded-xl p-4">
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="font-semibold">{detail.buyer?.name || "-"}</p>
                      <p className="text-sm text-gray-700 mt-1">{detail.buyer?.email || "-"}</p>
                      <p className="text-sm text-gray-700">ID: {detail.buyer?.id ?? "-"}</p>
                    </div>
                  </div>

                  {/* Docs */}
                  <div className="mt-6">
                    <p className="font-bold text-[#4e342e] mb-2">Submitted Documents</p>

                    {Array.isArray(detail.documents) && detail.documents.length > 0 ? (
                      <div className="space-y-2">
                        {detail.documents.map((d) => (
                          <a
                            key={d.id}
                            href={d.download_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800"
                          >
                            <FileText className="w-5 h-5" />
                            <span className="font-semibold">{d.document_type}</span>
                            <span className="text-gray-500 text-sm">({d.filename})</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No documents found for this transfer.</p>
                    )}
                  </div>

                  {/* Terms / scope */}
                  <div className="mt-6">
                    <p className="font-bold text-[#4e342e] mb-2">Terms</p>
                    <pre className="bg-gray-50 border rounded-xl p-4 text-xs overflow-auto">
                      {JSON.stringify(detail.terms || {}, null, 2)}
                    </pre>
                  </div>

                  {/* Admin notes + decision */}
                  <div className="mt-6 border rounded-2xl p-4">
                    <p className="font-bold text-[#4e342e] flex items-center gap-2">
                      <MessageSquareText className="w-5 h-5" />
                      Admin Decision
                    </p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Decision
                        <select
                          value={decision}
                          onChange={(e) => setDecision(e.target.value)}
                          className="mt-1 w-full border rounded-xl px-3 py-2"
                        >
                          <option value="APPROVE">APPROVE</option>
                          <option value="REJECT">REJECT</option>
                          <option value="NEEDS_CORRECTION">NEEDS_CORRECTION</option>
                        </select>
                      </label>

                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Notes (optional but recommended)
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[90px]"
                            placeholder="Write notes for the parties…"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={closeDetail}
                        className="px-4 py-2 rounded-xl border border-black/10 hover:bg-gray-50"
                        disabled={submitting}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={submitDecision}
                        disabled={submitting}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold",
                          decision === "REJECT"
                            ? "bg-red-600 hover:bg-red-700"
                            : decision === "NEEDS_CORRECTION"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-green-600 hover:bg-green-700",
                          submitting && "opacity-60"
                        )}
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          decision === "REJECT" ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />
                        )}
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
