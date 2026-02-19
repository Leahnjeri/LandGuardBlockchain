// MyProperties.jsx
import React, { useEffect, useState } from "react";

export default function MyProperties({ onOpenMap, onTransfer }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    const fetchLands = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("http://localhost:8000/lands/my-lands", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to fetch properties");
        }

        const data = await res.json();
        const baseLands = Array.isArray(data) ? data : [];

        if (cancelled) return;
        setLands(baseLands);
        setLoading(false);

        // Fetch locations (reverse geocode)
        setLoadingLocations(true);

        const landsWithLocation = await Promise.all(
          baseLands.map(async (land) => {
            // If no coords, skip
            if (land?.latitude == null || land?.longitude == null) {
              return { ...land, location: "Unknown" };
            }

            try {
              const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${land.latitude}&lon=${land.longitude}`;

              // Nominatim prefers a User-Agent header; browsers limit it,
              // but adding Accept-Language can help, and keeping requests minimal matters.
              const locationRes = await fetch(url, {
                headers: {
                  "Accept-Language": "en",
                },
              });

              if (!locationRes.ok) throw new Error("Reverse geocode failed");

              const locationData = await locationRes.json();
              return { ...land, location: locationData?.display_name || "Unknown" };
            } catch {
              return { ...land, location: "Unknown" };
            }
          })
        );

        if (cancelled) return;
        setLands(landsWithLocation);
        setLoadingLocations(false);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Something went wrong");
        setLands([]);
        setLoading(false);
        setLoadingLocations(false);
      }
    };

    if (token) fetchLands();
    else {
      setError("No token found. Please log in again.");
      setLoading(false);
      setLoadingLocations(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-[#4e342e] mb-4">My Properties</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Title Number</th>
              <th className="py-2 px-4 border-b">Size (acres)</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Loading properties...
                </td>
              </tr>
            ) : lands.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No properties to display
                </td>
              </tr>
            ) : (
              lands.map((land, index) => (
                <tr key={land.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{land.title_number}</td>
                  <td className="py-2 px-4 border-b">{land.size}</td>

                  <td className="py-2 px-4 border-b">
                    {land.created_at
                      ? new Date(land.created_at).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="py-2 px-4 border-b">
                    {loadingLocations ? "Loading..." : land.location || "Unknown"}
                  </td>

                  <td className="py-2 px-4 border-b">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenMap?.(land)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        View on Map
                      </button>

                      <button
                        type="button"
                        onClick={() => onTransfer?.(land)}
                        className="bg-purple-500 text-white px-2 py-1 rounded text-sm hover:bg-purple-600"
                      >
                        Transfer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
