import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function IncomingTransfersList({ onSelect }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (!token) return setMsg("Please log in.");
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:8000/transfer/incoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.detail || "Failed to load transfers.");

      const pending = (Array.isArray(data) ? data : []).filter(
        (t) => t.status === "PENDING_NEW_OWNER_CONFIRMATION"
      );
      setItems(pending);
    } catch (e) {
      console.error(e);
      setMsg("Server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-[#4e342e]">Pending Transfers</h1>
        <button onClick={load} className="px-3 py-2 rounded-lg bg-black text-white">
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading…
        </div>
      )}

      {msg && <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">{msg}</div>}

      {!loading && !msg && items.length === 0 && (
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700">
          No pending transfers for your confirmation.
        </div>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect?.(t)}
            className="w-full text-left p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#4e342e]">Ref: {t.reference_no}</p>
                <p className="text-sm text-gray-700 mt-1">
                  Type: {t.transfer_type} • Status: {t.status}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-700">Review & Accept →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
