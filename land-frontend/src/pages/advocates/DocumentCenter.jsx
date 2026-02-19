// src/pages/advocates/DocumentCenter.jsx
import React, { useState } from "react";
import { Surface } from "./ui";

export default function DocumentCenter() {
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

      <Surface className="p-4">
        {recent.length === 0 ? (
          <div className="p-4 rounded-lg bg-zinc-50 border text-zinc-700">No recent documents yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recent.map((d, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-black/10">
                <p className="font-semibold text-[#4e342e]">{String(d.document_type || "Document")}</p>
                <p className="text-xs text-gray-600 mt-1 break-all">{d.filename || d.file_url || "N/A"}</p>
                <p className="text-xs text-gray-500 mt-2">Case: {d.reference_no || "N/A"}</p>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}
