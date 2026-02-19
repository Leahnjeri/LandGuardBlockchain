// src/pages/advocates/AdvocateHome.jsx
import React from "react";
import { ArrowRight, Gavel, ShieldCheck } from "lucide-react";
import { Pill, Surface } from "./ui";

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/10 shadow-sm p-5">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-4xl font-extrabold text-[#4e342e]">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

export default function AdvocateHome({ onGo }) {
  // UI-only placeholders (wire later)
  const stats = { openCases: 6, waitingNewOwner: 2, pendingAdmin: 3, needsCorrection: 1 };

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
              Official searches and client transfers — designed for legal workflows.
            </p>
          </div>
          <Pill>
            <Gavel className="w-4 h-4 text-[#4e342e]" />
            Court-ready workflows
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
              Submit searches backed by court order / client authority.
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
              Inheritance / court order transfers on behalf of clients.
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
              Track status, upload missing docs, respond to admin notes.
            </p>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <Pill>
            <ShieldCheck className="w-4 h-4 text-[#4e342e]" />
            Owner is notified (FYI)
          </Pill>
          <p className="text-xs text-gray-500">These actions route to Admin processing.</p>
        </div>
      </Surface>
    </>
  );
}
