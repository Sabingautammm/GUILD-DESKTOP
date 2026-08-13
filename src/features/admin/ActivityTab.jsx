import { useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { SkeletonList } from "../../components/ui/Skeleton";
import { getActivityLogs } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";
import { playerName } from "../../utils/playerName";

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
    return <SkeletonList count={6} />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-xs text-red-300">
        <FiAlertCircle /> {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="text-xs text-guild-500">No recorded changes yet. Role changes, kicks, transfers and approvals appear here.</p>;
  }

  return (
    <ul className="divide-y divide-guild-800 rounded-xl card-surface">
      {logs.map((log) => (
        <li key={log._id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-guild-300">
              <span className="font-bold text-cream">{log.field}</span>
              {log.oldValue && <span className="text-guild-500">: {truncate(log.oldValue)}</span>}
              {log.oldValue && log.newValue && <span className="text-guild-500"> → </span>}
              {log.newValue && <span className="font-bold text-gold-400">{truncate(log.newValue)}</span>}
            </p>
            <span className="text-[11px] text-guild-500 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-guild-500 mt-1">
            {log.entityType} · by {playerName(log.changedByUserId, "Unknown")}
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