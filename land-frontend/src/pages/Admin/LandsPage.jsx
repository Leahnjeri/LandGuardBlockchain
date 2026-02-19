import { useEffect, useState } from "react";

export default function LandsPage() {
  const [lands, setLands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    async function loadLands() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/lands/admin-list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Invalid response:", data);
          setLoading(false);
          return;
        }

        // Add human-readable location
        const landsWithLocation = await Promise.all(
          data.map(async (land) => {
            let location = "Unknown";

            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${land.latitude}&lon=${land.longitude}`
              );
              const geoData = await geoRes.json();
              location = geoData.display_name || "Unknown";
            } catch (err) {
              console.log("Geocode error:", err);
            }

            return { ...land, location };
          })
        );

        setLands(landsWithLocation);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingLocations(false);
      }
    }

    loadLands();
  }, []);

  const filtered = lands.filter((l) =>
    Object.values(l).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <div className="p-6">Loading lands...</div>;

  // Status badge styling
const statusBadge = (status) => {
  let colors;

  switch (status.toLowerCase()) {
    case "verified":
      colors = "bg-green-100 text-green-700 border border-green-300";
      break;
    case "rejected":
      colors = "bg-red-100 text-red-700 border border-red-300";
      break;
    case "pending":
    default:
      colors = "bg-yellow-100 text-yellow-700 border border-yellow-300";
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${colors}`}>
      {status}
    </span>
  );
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Lands</h1>

      <input
        type="text"
        placeholder="Search lands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-lg mb-4 w-full max-w-sm"
      />

      <div className="overflow-x-auto">
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title Number</th>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">National ID</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Size (Acres)</th>
              <th className="p-2 border">Verification</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No lands found
                </td>
              </tr>
            ) : (
              filtered.map((land) => (
                <tr key={land.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{land.id}</td>
                  <td className="p-2 border">{land.title_number}</td>
                  <td className="p-2 border">{land.owner_name}</td>
                  <td className="p-2 border">{land.owner_id}</td>

                  <td className="p-2 border">
                    {loadingLocations ? "Loading..." : land.location}
                  </td>

                  <td className="p-2 border">
                    {typeof land.size === "number"
                      ? land.size.toFixed(2)
                      : "0.00"}
                  </td>

                  <td className="p-2 border">
                    {statusBadge(land.verification_status)}
                  </td>

                  <td className="p-2 border">
                    {land.created_at
                      ? new Date(land.created_at).toLocaleString()
                      : "-"}
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
