// MyProperties.jsx
import React, { useEffect, useState } from "react";

export default function MyProperties() {
  const [lands, setLands] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await fetch("http://localhost:8000/lands/my-lands", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const landsWithLocation = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (land) => {
            try {
              const locationRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${land.latitude}&lon=${land.longitude}`
              );
              const locationData = await locationRes.json();
              return { ...land, location: locationData.display_name || "Unknown" };
            } catch (err) {
              return { ...land, location: "Unknown" };
            }
          })
        );

        setLands(landsWithLocation);
        setLoadingLocations(false);
      } catch (err) {
        setLands([]);
        setLoadingLocations(false);
      }
    };

    fetchLands();
  }, [token]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-[#4e342e] mb-4">My Properties</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Title Number</th>
              <th className="py-2 px-4 border-b">Size (acres)</th>
              <th className="py-2 px-4 border-b">Verification Status</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lands.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
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
                    <span
                      className={`px-2 py-1 rounded-full text-white text-sm ${
                        land.verification_status === "Verified"
                          ? "bg-green-500"
                          : land.verification_status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {land.verification_status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(land.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {loadingLocations ? "Loading..." : land.location}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                      View on Map
                    </button>
                    <button className="bg-purple-500 text-white px-2 py-1 rounded text-sm hover:bg-purple-600">
                      Transfer
                    </button>
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
