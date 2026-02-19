// src/pages/advocates/ClientTransfers.jsx
import React from "react";
import TransferOwnership from "../TransferOwnership";
import { Surface } from "./ui";

/**
 * Reuse your existing TransferOwnership UI.
 * Backend already restricts advocates to inheritance/court_order.
 * Later we can pass a prop (mode="advocate") and make TransferOwnership default to advocate types.
 */
export default function ClientTransfers({ showNotification }) {
  return (
    <Surface className="p-4">
      <TransferOwnership showNotification={showNotification} />
    </Surface>
  );
}
