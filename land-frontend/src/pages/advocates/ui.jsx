// src/pages/advocates/ui.jsx
import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

export function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function Surface({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/80 backdrop-blur border border-black/10 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 border border-black/10 text-gray-700">
      {children}
    </span>
  );
}

export function BrandBlock({ modeLabel = "Advocate Mode" }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-11 h-11 rounded-2xl bg-[#4e342e] flex items-center justify-center shadow-sm">
        <ShieldCheck className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-extrabold text-[#4e342e] truncate">LandGuard</h1>
          <Pill>
            <Sparkles className="w-3.5 h-3.5" />
            {modeLabel}
          </Pill>
        </div>
        <p className="text-xs text-gray-600 truncate">Secure land verification & transfer</p>
      </div>
    </div>
  );
}

export function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUserInfo() {
  const savedName = localStorage.getItem("full_name") || localStorage.getItem("name");
  const savedRole = localStorage.getItem("role");

  const token = localStorage.getItem("token");
  const payload = decodeJwtPayload(token);

  const role = savedRole || payload?.role || payload?.user_role || payload?.type || "USER";
  const name =
    savedName ||
    payload?.full_name ||
    payload?.name ||
    payload?.username ||
    payload?.email ||
    "Unknown User";

  const normalizedRole = String(role).toUpperCase();
  const roleLabel = normalizedRole === "ADVOCATE" ? "Advocate" : normalizedRole === "ORG" ? "Organization" : "User";

  return { name, role: normalizedRole, roleLabel, payload };
}
