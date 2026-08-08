import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import { getNotifications, markAllRead } from "../services/api/notificationApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";

export default function NotificationsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getNotifications()
      .then((d) => !cancelled && setItems(d))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load notifications."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update notifications.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3A012]/10 text-[#B9660B]">
            <FiBell />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#17120D]">Notifications</h1>
            <p className="text-xs text-slate-500">Votes, transfers, approvals and more.</p>
          </div>
        </div>
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FiCheckCircle /> Mark all read
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400 py-12 text-center">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-500 py-12 text-center">{error}</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-[#6B5B45]">You're all caught up</p>
          <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n._id}
              className={`rounded-xl border p-4 transition-colors ${n.isRead ? "border-[#EDE1CB] bg-white" : "border-[#E3A012]/40 bg-[#FFFBEF]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#17120D]">{n.message}</p>
                {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#E3A012]" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {new Date(n.createdAt).toLocaleString()}
                {n.data?.guildUid && (
                  <button
                    onClick={() => navigate(`/guild/${n.data.guildUid}`)}
                    className="ml-2 font-semibold text-[#B9660B] hover:underline"
                  >
                    View guild →
                  </button>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}