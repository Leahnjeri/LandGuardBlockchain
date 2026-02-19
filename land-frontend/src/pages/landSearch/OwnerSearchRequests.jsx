import { useEffect, useMemo, useState } from "react";

export default function OwnerSearchRequests() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | rejected

  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);

  // Expand requester details per-card
  const [openDetailsId, setOpenDetailsId] = useState(null);

  // Modal + toast
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // "approve" | "reject"
  const [toast, setToast] = useState(null); // { type: "success"|"error", text: "" }
  const [loadingAction, setLoadingAction] = useState(false);

  const infoDisclosure = [
    "Land ownership verification status",
    "Land location details (as provided in your system)",
    "Land size/dimensions",
    "Owner contact details (email/phone) if your system exposes them",
    "Any allowed land history/encumbrance info (if you later add it)",
  ];

  useEffect(() => {
    const fetchOwnerRequests = async () => {
      try {
        if (!token) return;

        const res = await fetch("http://localhost:8000/lands/owner/search-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch owner requests");

        const data = await res.json();

        setPendingRequests(data.filter(r => r.status === "Pending"));
        setApprovedRequests(data.filter(r => r.status === "Approved"));
        setRejectedRequests(data.filter(r => r.status === "Rejected"));
      } catch (e) {
        console.error(e);
        setToast({ type: "error", text: "Failed to load requests." });
        setTimeout(() => setToast(null), 3500);
      }
    };

    fetchOwnerRequests();
  }, [token]);

  const pendingCount = useMemo(() => pendingRequests.length, [pendingRequests]);
  const approvedCount = useMemo(() => approvedRequests.length, [approvedRequests]);
  const rejectedCount = useMemo(() => rejectedRequests.length, [rejectedRequests]);

  const openConfirm = (request, action) => {
    setConfirmItem(request);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (loadingAction) return;
    setConfirmOpen(false);
    setConfirmItem(null);
    setConfirmAction(null);
  };

  const runAction = async () => {
    if (!confirmItem || !confirmAction) return;
    setLoadingAction(true);

    try {
      const res = await fetch(
        `http://localhost:8000/lands/search-request/${confirmItem.id}?action=${confirmAction}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Action failed");
      const updated = await res.json();

      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r.id !== confirmItem.id));

      // Move to correct list
      if (confirmAction === "approve") {
        setApprovedRequests(prev => [updated, ...prev]);
        setToast({ type: "success", text: "✅ Search approved" });
        setActiveTab("approved");
      } else {
        setRejectedRequests(prev => [updated, ...prev]);
        setToast({ type: "success", text: "✅ Request rejected" });
        setActiveTab("rejected");
      }

      setTimeout(() => setToast(null), 3500);
      closeConfirm();
    } catch (e) {
      console.error(e);
      setToast({ type: "error", text: "Failed to update request." });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setLoadingAction(false);
    }
  };

  const tabs = [
    { key: "pending", label: "Pending Requests", count: pendingCount },
    { key: "approved", label: "Approved Requests", count: approvedCount },
    { key: "rejected", label: "Rejected Requests", count: rejectedCount },
  ];

  const list =
    activeTab === "pending"
      ? pendingRequests
      : activeTab === "approved"
      ? approvedRequests
      : rejectedRequests;

  const statusBadge = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    if (status === "Approved") return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-100 px-6 pt-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 bottom-10 -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOpen && confirmItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#e0d7d0] overflow-hidden">
            <div className="p-5 border-b border-[#eee]">
              <h3 className="text-lg font-bold text-[#4e342e]">
                {confirmAction === "approve" ? "Approve request?" : "Reject request?"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Title Number:{" "}
                <span className="font-semibold">{confirmItem.title_number}</span>
              </p>
            </div>

            <div className="p-5 space-y-4">
              {confirmAction === "approve" ? (
                <>
                  <p className="text-sm text-gray-700">
                    If you approve, the Applicant will be able to view:
                  </p>

                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {infoDisclosure.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>

                  <div className="bg-[#faf7f5] border border-[#e0d7d0] rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Applicant Reason</p>
                    <p className="text-sm text-gray-700">{confirmItem.reason}</p>

                    {confirmItem.description && (
                      <>
                        <p className="text-xs text-gray-500 mt-3 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{confirmItem.description}</p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-700">
                  Rejecting will deny the applicant access to any search results for this title number.
                </p>
              )}
            </div>

            <div className="p-5 border-t border-[#eee] flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={loadingAction}
                className="px-4 py-2 rounded-lg border border-[#d7ccc8] text-[#4e342e] font-semibold hover:bg-[#f5f1ee] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={runAction}
                disabled={loadingAction}
                className={`px-5 py-2 rounded-lg text-white font-semibold disabled:opacity-60 ${
                  confirmAction === "approve" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {loadingAction
                  ? "Please wait..."
                  : confirmAction === "approve"
                  ? "Yes, Approve"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#8d6e63] mb-4">
        {tabs.map(t => (
          <div
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="cursor-pointer px-6 py-2 text-[#4e342e] font-medium relative"
          >
            <div className="flex items-center gap-2">
              <span>{t.label}</span>
              <span className="text-xs bg-[#e0d7d0] text-[#4e342e] px-2 py-0.5 rounded-full">
                {t.count}
              </span>
            </div>

            {activeTab === t.key && (
              <span className="absolute left-0 right-0 -bottom-1 h-1 bg-[#4e342e] rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#f5f1ee] rounded-xl shadow-inner p-6">
        <h3 className="text-2xl font-bold text-[#4e342e] mb-6">
          {activeTab === "pending"
            ? "Pending Requests"
            : activeTab === "approved"
            ? "Approved Requests"
            : "Rejected Requests"}
        </h3>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0d7d0] p-8 text-center text-gray-500">
            No records found
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(r => {
              const isOpen = openDetailsId === r.id;
              const requester = r.requester; // requires backend to send requester info

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl shadow border border-[#e0d7d0] overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-[#4e342e] text-lg">
                          {r.title_number}
                        </p>

                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">{r.reason}</p>

                      {r.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Description:</span>{" "}
                          {r.description}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                            {r.status === "Pending" && (
                                <>Submitted: {new Date(r.created_at).toLocaleString()}</>
                            )}

                            {r.status === "Approved" && (
                                <>
                                Approved:{" "}
                                {r.decided_at
                                    ? new Date(r.decided_at).toLocaleString()
                                    : "— (missing decided_at from API)"}
                                </>
                            )}

                            {r.status === "Rejected" && (
                                <>
                                Rejected:{" "}
                                {r.decided_at
                                    ? new Date(r.decided_at).toLocaleString()
                                    : "— (missing decided_at from API)"}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-end">
                      <button
                        onClick={() => setOpenDetailsId(isOpen ? null : r.id)}
                        className="px-4 py-2 rounded-lg border border-[#d7ccc8] text-[#4e342e] font-semibold hover:bg-[#f5f1ee]"
                      >
                        {isOpen ? "Hide requester" : "View Applicant"}
                      </button>

                      {/* Actions only on pending tab */}
                      {activeTab === "pending" && (
                        <>
                          <button
                            onClick={() => openConfirm(r, "approve")}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-95"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => openConfirm(r, "reject")}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-95"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Requester details section */}
                  {isOpen && (
                    <div className="border-t border-[#eee] bg-[#faf7f5] p-5">
                      <h4 className="font-semibold text-[#4e342e] mb-3">
                        Requester Details
                      </h4>

                      {!requester ? (
                        <p className="text-sm text-gray-600">
                          Requester details are not available yet. (Backend needs to send `requester` object.)
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-[#e0d7d0] rounded-lg p-4">
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-semibold text-[#4e342e]">
                              {(requester.first_name || "") + " " + (requester.last_name || "")}
                            </p>
                          </div>

                          <div className="bg-white border border-[#e0d7d0] rounded-lg p-4">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-semibold text-[#4e342e] break-all">
                              {requester.email || "—"}
                            </p>
                          </div>

                          <div className="bg-white border border-[#e0d7d0] rounded-lg p-4">
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-semibold text-[#4e342e]">
                              {requester.phone_number || "—"}
                            </p>
                          </div>

                          <div className="bg-white border border-[#e0d7d0] rounded-lg p-4">
                            <p className="text-xs text-gray-500">National ID</p>
                            <p className="font-semibold text-[#4e342e]">
                              {requester.national_id || "—"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
