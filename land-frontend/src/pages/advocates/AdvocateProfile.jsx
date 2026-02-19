// src/pages/advocates/AdvocateProfile.jsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import { Pill, Surface, getCurrentUserInfo } from "./ui";

export default function AdvocateProfile() {
  const { name, payload } = getCurrentUserInfo();

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

      <Surface className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
          <div className="p-4 rounded-2xl bg-white border border-black/10">
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{name}</p>
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

        <div className="px-5 pb-5">
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
              Tip: Later you can restrict court-order transfers to verified advocates only.
            </p>
          </div>
        </div>
      </Surface>
    </div>
  );
}
