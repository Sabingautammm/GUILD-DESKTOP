import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { getActivityLogs } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";

export default function ActivityTab() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActivityLogs()
      .then((d) => !cancelled && setLogs(d))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load activity."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
        <FiAlertCircle /> {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="text-xs text-slate-400">No recorded changes yet. Role changes, kicks, transfers and approvals appear here.</p>;
  }

  return (
    <ul className="divide-y divide-[#F3EADA] rounded-xl border border-[#EDE1CB] bg-white">
      {logs.map((log) => (
        <li key={log._id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-medium text-[#17120D]">
              <span className="font-bold">{log.field}</span>
              {log.oldValue && <span className="text-slate-400">: {truncate(log.oldValue)}</span>}
              {log.oldValue && log.newValue && <span className="text-slate-400"> → </span>}
              {log.newValue && <span className="font-semibold text-[#B9660B]">{truncate(log.newValue)}</span>}
            </p>
            <span className="text-[11px] text-slate-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {log.entityType} · by {log.changedByUserId?.name ?? "Unknown"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function truncate(s) {
  const str = String(s);
  return str.length > 60 ? `${str.slice(0, 57)}…` : str;
}