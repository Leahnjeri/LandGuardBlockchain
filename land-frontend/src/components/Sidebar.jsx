// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#4e342e] text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8">LandGuard</h2>

      <ul className="space-y-4 font-medium">
        <li>
          <Link to="/dashboard" className="hover:text-amber-300 block">
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/verify-land" className="hover:text-amber-300 block">
            Verify Land
          </Link>
        </li>

        <li>
          <Link to="/transfer" className="hover:text-amber-300 block">
            Transfer Ownership
          </Link>
        </li>

        <li>
          <Link to="/my-properties" className="hover:text-amber-300 block">
            My Properties
          </Link>
        </li>

        <li>
          <Link to="/pending" className="hover:text-amber-300 block">
            Pending Requests
          </Link>
        </li>

        <li>
          <Link to="/notifications" className="hover:text-amber-300 block">
            Notifications
          </Link>
        </li>

        <li>
          <Link to="/support" className="hover:text-amber-300 block">
            Support
          </Link>
        </li>

        <li>
          <Link to="/settings" className="hover:text-amber-300 block">
            Account Settings
          </Link>
        </li>

        <li>
          <Link to="/logout" className="hover:text-red-400 block">
            Logout
          </Link>
        </li>
      </ul>
    </aside>
  );
}
