import { useCallback, useEffect, useState } from "react";
import { FiCheck, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import { SkeletonMediaGrid } from "../../components/ui/Skeleton";
import { getPendingMedia, moderateMedia } from "../../services/api/mediaApi";
import { ApiError } from "../../services/api/client";
import { useToast } from "../../components/toast/ToastProvider";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { playerName } from "../../utils/playerName";

export default function MediaTab() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getPendingMedia()
      .then((d) => !cancelled && setItems(Array.isArray(d) ? d : []))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load pending media."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  const decide = async (media, approvalStatus) => {
    setBusyId(media._id);
    try {
      await toast.promise(moderateMedia(media._id, approvalStatus), {
        loading: approvalStatus === "approved" ? "Approving…" : "Rejecting…",
        success: approvalStatus === "approved" ? "Media approved and published" : "Media rejected",
        error: (err) => (err instanceof ApiError ? err.message : "Moderation failed."),
      });
      setItems((prev) => prev.filter((m) => m._id !== media._id));
    } catch {
      // toast handled it
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return <SkeletonMediaGrid count={6} />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-xs text-red-300">
        <FiAlertCircle /> {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm font-bold text-cream">Nothing awaiting approval</p>
        <p className="mt-1 text-xs text-guild-500">
          New member uploads land here for guild admins to review before they go public.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">
        Pending media ({items.length})
      </h2>
      {items.map((m) => (
        <div key={m._id} className="flex items-center gap-4 rounded-xl card-surface p-4">
          {m.type === "video" ? (
            <video src={resolveMediaUrl(m.url)} className="h-16 w-24 rounded-lg bg-guild-950 object-contain" muted />
          ) : (
            <img src={resolveMediaUrl(m.url)} alt="" className="h-16 w-24 rounded-lg bg-guild-950 object-contain" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-cream truncate">{playerName(m.uploaderId, "Unknown player")}</p>
            <p className="text-[11px] text-guild-500 truncate">{m.url}</p>
            <p className="text-[11px] text-guild-500 capitalize">
              {m.type} · {m.category} · {m.visibility}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => decide(m, "approved")}
              disabled={busyId === m._id}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busyId === m._id ? <FiLoader className="animate-spin" /> : <FiCheck />} Approve
            </button>
            <button
              onClick={() => decide(m, "rejected")}
              disabled={busyId === m._id}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <FiX /> Reject
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}