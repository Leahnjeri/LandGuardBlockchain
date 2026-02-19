import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // optional: loading state

  useEffect(() => {
    async function loadUsers() {
      try {
        const token = localStorage.getItem("token"); // must match what you saved on login

        const res = await fetch("http://localhost:8000/users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Server responded with:", res.status);
          setUsers([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Invalid data:", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filtered = Array.isArray(users)
    ? users.filter((u) =>
        Object.values(u).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      )
    : [];

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="p-1">
      <h1 className="text-2xl font-semibold mb-1">Users</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-lg mb-4 w-full max-w-sm"
      />

      <div className="overflow-x-auto">
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">First Name</th>
              <th className="p-2 border">Last Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">National ID</th>
              <th className="p-2 border">Phone Number</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.firstName}</td>
                <td className="p-2 border">{u.lastName}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.national_id}</td>
                <td className="p-2 border">{u.phone_number}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
