import React, { useState } from "react";
import CesiumVerifyLand from "./CesiumVerifyLand";
import TransferOwnership from "./TransferOwnership";
import MyProperties from "./MyProperties";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#4e342e] text-white p-6 sticky top-0 h-screen">
        <h2 className="text-2xl font-bold mb-8">LandGuard</h2>
        <ul className="space-y-4 font-medium">
    <li
      className={`cursor-pointer hover:text-amber-300 ${activeTab === "dashboard" ? "text-amber-300" : ""}`}
      onClick={() => setActiveTab("dashboard")}
    >
      Dashboard
    </li>
    <li
      className={`cursor-pointer hover:text-amber-300 ${activeTab === "verifyLand" ? "text-amber-300" : ""}`}
      onClick={() => setActiveTab("verifyLand")}
    >
      Verify Land
    </li>
    <li
      className={`cursor-pointer hover:text-amber-300 ${activeTab === "transfer" ? "text-amber-300" : ""}`}
      onClick={() => setActiveTab("transfer")}
    >
      Transfer Ownership
    </li>
    <li
      className={`cursor-pointer hover:text-amber-300 ${activeTab === "properties" ? "text-amber-300" : ""}`}
      onClick={() => setActiveTab("properties")}
    >
      My Properties
    </li>
    <li className="hover:text-red-400 cursor-pointer">Logout</li>
  </ul>
</aside>


      {/* Main Content */}
      <main className="flex-1 px-6 py-4 bg-zinc-50">
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold text-[#4e342e] mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="shadow-md border border-amber-200 p-4 rounded">
                <h3 className="text-amber-800 text-xl">Properties Owned</h3>
                <p className="text-4xl font-bold">3</p>
              </div>
              <div className="shadow-md border border-amber-200 p-4 rounded">
                <h3 className="text-amber-800 text-xl">Pending Transfers</h3>
                <p className="text-4xl font-bold">1</p>
              </div>
              <div className="shadow-md border border-amber-200 p-4 rounded">
                <h3 className="text-amber-800 text-xl">Verified Titles</h3>
                <p className="text-4xl font-bold">12</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "verifyLand" && <CesiumVerifyLand />}

        {activeTab === "transfer" && <TransferOwnership />}

        {activeTab === "properties" && <MyProperties />}
      </main>
    </div>
  );
}
