// NewOwnerAcceptTransfer.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";

// read query param (still useful for email links)
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function prettyLabel(key) {
  if (!key) return "";
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function safeStr(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function isEmptyObject(obj) {
  return !obj || typeof obj !== "object" || Array.isArray(obj) ? true : Object.keys(obj).length === 0;
}

export default function NewOwnerAcceptTransfer({
  acceptToken: acceptTokenProp,
  transferId: transferIdProp,
  onBack,
}) {
  const token = localStorage.getItem("token");

  // allow both: props first, else URL query
  const acceptToken = useMemo(
    () => acceptTokenProp || getQueryParam("token"),
    [acceptTokenProp]
  );
  const transferId = useMemo(
    () => transferIdProp || getQueryParam("transfer_id"),
    [transferIdProp]
  );

  const [loading, setLoading] = useState(false);
  const [docBusyId, setDocBusyId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [sig, setSig] = useState({ agreed: false, full_name: "" });

  const fetchPreview = async () => {
    if (!acceptToken && !transferId) {
      setMessage("No transfer selected yet.");
      return;
    }
    if (!token) {
      setMessage("Please log in (or sign up) using the invited email, then try again.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const url = acceptToken
        ? `http://localhost:8000/transfer/accept/preview?token=${encodeURIComponent(acceptToken)}`
        : `http://localhost:8000/transfer/incoming/${encodeURIComponent(transferId)}/preview`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.detail || "Failed to load transfer request.");
        setPreview(null);
        return;
      }
      setPreview(data);
    } catch (e) {
      console.error(e);
      setMessage("Server error loading transfer request.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptToken, transferId]);

  const openDoc = async (downloadUrl, filename = "document") => {
    if (!token) return setMessage("Please log in first.");
    if (!downloadUrl) return setMessage("Document link is missing.");

    setDocBusyId(filename);
    setMessage("");
    try {
      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let err = "Failed to open document.";
        try {
          const data = await res.json();
          err = data.detail || err;
        } catch {
          // ignore
        }
        setMessage(err);
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Try to open in new tab
      const w = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        // Popup blocked -> download fallback
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // Cleanup later
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      console.error(e);
      setMessage("Server error opening document.");
    } finally {
      setDocBusyId(null);
    }
  };

  const acceptTransfer = async () => {
    if (!token) return setMessage("Please log in first.");
    if (!sig.agreed) return setMessage("Please accept the declaration to proceed.");
    if (!sig.full_name.trim()) return setMessage("Enter your full name to sign.");

    setLoading(true);
    setMessage("");
    try {
      const url = acceptToken
        ? `http://localhost:8000/transfer/accept?token=${encodeURIComponent(acceptToken)}`
        : `http://localhost:8000/transfer/incoming/${encodeURIComponent(transferId)}/accept`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agreed: sig.agreed, full_name: sig.full_name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.detail || "Failed to accept transfer.");
        return;
      }

      setMessage("✅ Transfer accepted. Admin review will begin.");
      setPreview((p) => (p ? { ...p, status: data.status || "PENDING_ADMIN_APPROVAL" } : p));
    } catch (e) {
      console.error(e);
      setMessage("Server error accepting transfer.");
    } finally {
      setLoading(false);
    }
  };

  const statusIsPending = preview?.status === "PENDING_NEW_OWNER_CONFIRMATION";

  const docs = Array.isArray(preview?.documents) ? preview.documents : [];
  const parties = preview?.parties && typeof preview.parties === "object" ? preview.parties : {};
  const terms = preview?.terms && typeof preview.terms === "object" ? preview.terms : {};
  const signature = preview?.signature && typeof preview.signature === "object" ? preview.signature : {};

  return (
    <div className="w-full p-6 space-y-6">
      {/* Back + Refresh */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={fetchPreview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <h1 className="text-3xl font-bold text-[#4e342e]">Confirm Land Transfer</h1>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.startsWith("✅")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      )}

      {!token && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          You must log in (or sign up) with the same email that received the invitation.
        </div>
      )}

      {preview && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="font-semibold text-[#4e342e]">Transfer Request Details</p>
          </div>

          {/* Basic summary */}
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <p>
              <span className="font-medium">Reference No:</span> {preview.reference_no}
            </p>
            <p>
              <span className="font-medium">Status:</span> {preview.status}
            </p>
            <p>
              <span className="font-medium">Land Title:</span> {preview.land_title_number || "N/A"}
            </p>
            <p>
              <span className="font-medium">Transfer Type:</span> {preview.transfer_type || "N/A"}
            </p>
            <p>
              <span className="font-medium">Transfer To:</span> {preview.transfer_to || "N/A"}
            </p>
            <p>
              <span className="font-medium">Initiator:</span>{" "}
              {preview.initiator_name || "N/A"} ({preview.initiator_email || "N/A"})
            </p>
          </div>

          {/* Initiator-filled details */}
          <div className="border rounded-xl p-4 space-y-4">
            <p className="font-semibold text-[#4e342e]">Details Provided by Initiator</p>

            {/* Parties */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Parties</p>
              {isEmptyObject(parties) ? (
                <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">
                  No party details provided.
                </div>
              ) : (
                <div className="bg-zinc-50 border rounded-lg p-3 space-y-2">
                  {Object.entries(parties).map(([k, v]) => (
                    <div key={k} className="text-sm">
                      <p className="font-medium text-gray-800">{prettyLabel(k)}</p>
                      <pre className="text-xs bg-white border rounded-lg p-2 overflow-auto">
                        {typeof v === "object" ? JSON.stringify(v, null, 2) : safeStr(v)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Terms</p>
              {isEmptyObject(terms) ? (
                <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">
                  No terms provided.
                </div>
              ) : (
                <pre className="text-xs bg-zinc-50 border rounded-lg p-3 overflow-auto">
                  {JSON.stringify(terms, null, 2)}
                </pre>
              )}
            </div>

            {/* Signature (initiator + other metadata) */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Signatures / Declarations</p>
              {isEmptyObject(signature) ? (
                <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">
                  No signature metadata provided.
                </div>
              ) : (
                <pre className="text-xs bg-zinc-50 border rounded-lg p-3 overflow-auto">
                  {JSON.stringify(signature, null, 2)}
                </pre>
              )}
              <p className="text-xs text-gray-500 mt-2">
                You can review the initiator&apos;s declaration above. Your acceptance will be added once you sign below.
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4e342e]" />
              <p className="font-semibold text-[#4e342e]">Uploaded Documents</p>
            </div>

            {docs.length === 0 ? (
              <div className="text-sm text-gray-600 bg-zinc-50 border rounded-lg p-3">
                No documents were attached.
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((d) => {
                  const filename = d?.filename || (d?.file_url ? String(d.file_url).split("/").pop() : "document");
                  const label = d?.document_type ? prettyLabel(d.document_type) : "Document";
                  const downloadUrl = d?.download_url || d?.downloadUrl || d?.url; // support variants

                  const busy = docBusyId === filename;

                  return (
                    <div
                      key={d.id ?? `${d.document_type}-${filename}`}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-600 break-all">{filename}</p>
                        {d?.uploaded_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(d.uploaded_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDoc(downloadUrl, filename)}
                          disabled={!downloadUrl || busy}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4e342e] text-white text-sm disabled:opacity-60"
                          title={!downloadUrl ? "No download URL provided by backend" : "Open"}
                        >
                          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          {busy ? "Opening…" : "View / Download"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Tip: If a document doesn’t open, your browser may be blocking popups — the system will download it instead.
            </p>
          </div>

          {/* Status gate */}
          {!statusIsPending ? (
            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700">
              This transfer is not waiting for your confirmation.
            </div>
          ) : (
            <>
              {/* New owner acceptance */}
              <div className="border rounded-xl p-4">
                <p className="font-semibold text-[#4e342e] mb-2">Your Acceptance (Digital Signature)</p>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={sig.agreed}
                    onChange={(e) => setSig((p) => ({ ...p, agreed: e.target.checked }))}
                  />
                  <span>
                    I confirm that I have reviewed the details and documents above, and I accept this transfer request.
                  </span>
                </label>

                <div className="mt-3">
                  <label className="font-semibold block mb-2 text-[#4e342e]">Type your full name to sign</label>
                  <input
                    className="border p-3 rounded-lg w-full"
                    placeholder="Your full legal name"
                    value={sig.full_name}
                    onChange={(e) => setSig((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={acceptTransfer}
                disabled={loading || !token}
                className="bg-[#4e342e] text-white py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Accept Transfer
              </button>

              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex gap-2 items-start">
                <XCircle className="w-5 h-5 mt-0.5" />
                If you didn’t request this transfer, do not accept. Contact support/admin.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
