// src/components/LandTable.jsx
export default function LandTable({ lands }) {
  if (!lands || lands.length === 0) {
    return <p className="text-gray-600">No lands found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Title Number</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3 text-left">Size (Ha)</th>
          </tr>
        </thead>
        <tbody>
          {lands.map((land, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{land.title}</td>
              <td className="p-3">{land.location}</td>
              <td className="p-3">{land.owner}</td>
              <td className="p-3">{land.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
