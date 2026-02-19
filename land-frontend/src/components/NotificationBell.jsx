import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationBell({ onNavigate }) {
  const token = localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const boxRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await fetch("http://localhost:8000/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.unread ?? 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`http://localhost:8000/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Load unread count initially + poll every 10 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);

    if (next) {
      await fetchNotifications();
      await fetchUnread();
    }
  };

  const handleItemClick = async (n) => {
    await markRead(n.id);
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
    );
    await fetchUnread();
    setOpen(false);

    // Let parent decide what navigation means (tabs, routes, etc.)
    onNavigate?.(n);
  };

  return (
    <div className="relative bg-transparent" ref={boxRef}>
      {/* Bell */}
      <div
        onClick={toggle}
        className="relative cursor-pointer select-none 
                    transition-transform duration-200 ease-out
                    hover:scale-110 active:scale-95"
        >
        <Bell className="w-6 h-6 text-gray-700" />
        {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
            {unread > 9 ? "9+" : unread}
            </span>
        )}
        </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[90vw] bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b bg-[#faf7f5]">
            <div className="font-semibold text-[#4e342e]">Notifications</div>
            <div className="text-xs text-gray-600">
              {unread} unread • {items.length} total
            </div>
          </div>

          <div className="max-h-96 overflow-auto">
            {loading && (
              <div className="px-4 py-4 text-sm text-gray-600">Loading…</div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-600">
                No notifications yet.
              </div>
            )}

            {!loading &&
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
                    !n.is_read ? "bg-amber-50" : "bg-white"
                  }`}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full ${
                        !n.is_read ? "bg-red-500" : "bg-gray-300"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#4e342e] truncate">
                        {n.title}
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {n.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
