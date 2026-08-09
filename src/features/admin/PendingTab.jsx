import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { getPendingActions, votePendingAction } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";
import { useToast } from "../../components/toast/ToastProvider";

const TYPE_LABEL = {
  kick: "Kick player",
  approve_join: "Approve application",
  approve_reapply: "Approve re-application",
  reject_join: "Reject application",
};

export default function PendingTab() {
  const toast = useToast();
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getPendingActions()
      .then((d) => !cancelled && setActions(d))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load pending actions."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const vote = async (actionId, vote) => {
    setBusyId(actionId);
    try {
      await toast.promise(votePendingAction(actionId, vote), {
        loading: "Recording vote…",
        success: "Vote recorded",
        successDescription: "2 matching votes execute/cancel the action.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not vote."),
      });
      setRefreshKey((k) => k + 1);
    } catch {
      // toast handled it
    } finally {
      setBusyId(null);
    }
  };

  const open = actions.filter((a) => a.status === "pending" || a.status === "escalated");
  const finished = actions.filter((a) => a.status !== "pending" && a.status !== "escalated");

  return (
    <section className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
          <FiAlertCircle /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">
              Awaiting votes ({open.length})
            </h2>
            {open.length === 0 ? (
              <p className="text-xs text-slate-400">No actions waiting for votes.</p>
            ) : (
<ul className="space-y-3">
                {open.map((a) => (
                    <li key={a._id} className="rounded-xl border border-[#EDE1CB] bg-white p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-[#17120D]">
                            {TYPE_LABEL[a.type] ?? a.type}{" "}
                            <span className="text-stone-400">for {a.targetUserId?.name ?? "Player"}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Initiated by {a.initiatorUserId?.name ?? "Officer"}{" "}
                            {a.status === "escalated" && (
                              <span className="ml-1 rounded bg-[#E3A012]/15 px-1.5 py-0.5 font-semibold text-[#8a5200]">
                                Tied — Acting Leader ruling required
                              </span>
                            )}
                          </p>
                          {a.expiresAt && (
                            <p className="text-[11px] text-slate-400">
                              Auto-cancels {" "}{new Date(a.expiresAt).toLocaleDateString()} if unresolved
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === a._id}
                            onClick={() => vote(a._id, "approve")}
                            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            disabled={busyId === a._id}
                            onClick={() => vote(a._id, "reject")}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                      {a.votes && a.votes.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {a.votes.map((v) => (
                            <span
                              key={v.officerUserId ?? v.votedAt}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                v.vote === "approve" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                              }`}
                            >
                              {v.vote}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {finished.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">History</h2>
              <ul className="divide-y divide-[#F3EADA] rounded-xl border border-[#EDE1CB] bg-white">
                {finished.map((a) => (
                  <li key={a._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-semibold text-[#17120D]">
                      {TYPE_LABEL[a.type] ?? a.type} → {a.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}