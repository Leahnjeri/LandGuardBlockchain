// ApplyLandSearch.jsx
import React, { useState, useEffect } from "react";
import LandSearchCertificateModal from "./LandSearchCertificateModal"; // ✅ same folder: landSearch

export default function ApplyLandSearch({ onSubmit }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title_number: "",
    reason: "",
    description: "",
  });

  const [activeTab, setActiveTab] = useState("current");

  // Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);

  // Notification
  const [notification, setNotification] = useState(null);

  // Certificate modal state
  const [docOpen, setDocOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const openDoc = (req) => {
    setSelectedRequest(req);
    setDocOpen(true);
  };

  const closeDoc = () => {
    setDocOpen(false);
    setSelectedRequest(null);
  };

  // -------------------------------
  // Fetch search requests
  // -------------------------------
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:8000/lands/my-search-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        setPendingRequests(data.filter((r) => r.status === "Pending"));
        setApprovedRequests(data.filter((r) => r.status === "Approved"));
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, [token]);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------
  // Submit
  // -------------------------------
  const handleSubmit = async () => {
    if (!form.title_number || !form.reason) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        title_number: form.title_number,
        reason: form.reason,
        description: form.description || "",
      };

      const res = await fetch("http://localhost:8000/lands/search-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error details:", errorData);
        throw new Error("Submit failed");
      }

      const newRequest = await res.json();
      setPendingRequests((prev) => [...prev, newRequest]);
      onSubmit?.(newRequest);

      setNotification("✅ Search request submitted successfully");
      setTimeout(() => setNotification(null), 4000);

      setForm({
        title_number: "",
        reason: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit request. Check console for details.");
    }
  };

  const tabs = ["Current", "Pending", "Approved"];

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="flex flex-col w-full h-full bg-gray-100 px-6 pt-4">
      {/* Notification */}
      {notification && (
        <div className="fixed left-1/2 bottom-10 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* Certificate Modal */}
      <LandSearchCertificateModal
        open={docOpen}
        onClose={closeDoc}
        request={selectedRequest}
      />

      {/* Tabs */}
      <div className="flex border-b border-[#8d6e63] mb-4">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className="cursor-pointer px-6 py-2 text-[#4e342e] font-medium relative"
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <span className="absolute left-0 right-0 -bottom-1 h-1 bg-[#4e342e] rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* ================= CURRENT TAB ================= */}
      {activeTab === "current" && (
        <div className="flex-1 bg-[#f5f1ee] rounded-xl shadow-inner p-6">
          <h3 className="text-2xl font-bold text-[#4e342e] mb-6">
            Apply for a Land Search
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="bg-white rounded-xl shadow p-6 border border-[#d7ccc8] space-y-4">
              <div>
                <label className="text-sm font-medium text-[#4e342e]">
                  Title Number *
                </label>
                <input
                  type="text"
                  name="title_number"
                  value={form.title_number}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#4e342e]">
                  Reason *
                </label>
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-lg mt-1"
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-white rounded-xl shadow p-6 border border-[#d7ccc8] flex flex-col">
              <label className="text-sm font-medium text-[#4e342e] mb-1">
                Additional Description (optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="border p-2 rounded-lg h-32 resize-none"
              />

              <div className="mt-auto flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="mt-8 bg-[#4e342e] text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PENDING & APPROVED ================= */}
      {(activeTab === "pending" || activeTab === "approved") && (
        <div className="flex-1 bg-[#f5f1ee] rounded-xl shadow-inner p-6">
          <h3 className="text-2xl font-bold text-[#4e342e] mb-6">
            {activeTab === "pending"
              ? "Pending Land Search Requests"
              : "Approved Land Search Requests"}
          </h3>

          <div className="bg-white rounded-xl shadow border border-[#e0d7d0] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f3eee9] border-b border-[#e0d7d0]">
                <tr className="text-left text-[#4e342e]">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Title Number</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Date Submitted</th>
                  <th className="px-4 py-3 text-center">Status</th>

                  {/* Actions column only on Approved tab */}
                  {activeTab === "approved" && (
                    <th className="px-4 py-3 text-center">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {(activeTab === "pending"
                  ? pendingRequests
                  : approvedRequests
                ).map((r, index) => (
                  <tr
                    key={r.id || index}
                    className="border-b last:border-b-0 hover:bg-[#faf7f5]"
                  >
                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3 font-medium text-[#4e342e]">
                      {r.title_number}
                    </td>

                    <td className="px-4 py-3 text-gray-700">{r.reason}</td>

                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Actions cell only on Approved tab */}
                    {activeTab === "approved" && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDoc(r)}
                          className="bg-white border border-[#4e342e] text-[#4e342e] px-4 py-2 rounded-lg font-semibold hover:bg-[#faf7f5]"
                        >
                          View Certificate
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {(activeTab === "pending"
                  ? pendingRequests.length === 0
                  : approvedRequests.length === 0) && (
                  <tr>
                    <td
                      colSpan={activeTab === "approved" ? 6 : 5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
