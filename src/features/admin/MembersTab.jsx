import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { getRoster, getExMembers, promoteMember, processMemberAction, deleteExMember } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";
import { useToast } from "../../components/toast/ToastProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../../features/dashboard/data/playerTypes";

export default function MembersTab() {
  const toast = useToast();
  const { role } = useAuth();
  const [rows, setRows] = useState([]);
  const [exMembers, setExMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const canManage = role === "leader" || role === "acting_leader";
  const canPromoteOfficer = role === "leader" || role === "acting_leader";

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([getRoster(), getExMembers()])
      .then(([r, ex]) => {
        if (cancelled) return;
        setRows(r);
        setExMembers(ex);
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load roster."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const reload = () => setRefreshKey((k) => k + 1);

  const run = async (fn, opts) => {
    setBusyId(opts?.key ?? null);
    try {
      await toast.promise(fn, {
        loading: opts?.loading ?? "Working…",
        success: opts?.success ?? "Done",
        error: (err) => (err instanceof ApiError ? err.message : "Action failed."),
      });
      reload();
    } catch {
      // toast handled it
    } finally {
      setBusyId(null);
    }
  };

  const active = rows.filter((r) => r.status === "active");
  const pending = rows.filter((r) => r.status === "pending_approval");

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
              Pending applications ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-xs text-slate-400">No pending applications.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((m) => (
                  <li key={m._id} className="flex items-center justify-between gap-3 rounded-xl border border-[#EDE1CB] bg-white p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                        {m.userId?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17120D] truncate">{m.userId?.name ?? "Player"}</p>
                        <p className="text-[11px] text-slate-400">Applied {new Date(m.createdAt ?? m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={busyId === m.userId?._id}
                        onClick={() =>
                          run(processMemberAction("approve_join", m.userId._id), {
                            loading: "Approving…",
                            success: role === "officer" ? "Submitted to Officer vote" : "Member approved",
                          })
                        }
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === m.userId?._id}
                        onClick={() =>
                          run(processMemberAction("kick", m.userId._id), {
                            loading: "Rejecting…",
                            success: "Application rejected",
                          })
                        }
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">
              Active roster ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="text-xs text-slate-400">No active members yet.</p>
            ) : (
              <ul className="divide-y divide-[#F3EADA] rounded-xl border border-[#EDE1CB] bg-white">
                {active.map((m) => (
                  <li key={m._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                        {m.userId?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17120D] truncate">{m.userId?.name ?? "Player"}</p>
                        <p className="text-[11px] text-slate-400">{ROLE_LABEL[m.role] ?? m.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {canPromoteOfficer && m.role === "member" && (
                        <button
                          disabled={busyId === m.userId?._id}
                          onClick={() =>
                            run(promoteMember(m.userId._id, "officer"), {
                              loading: "Promoting…",
                              success: "Promoted to Officer",
                            })
                          }
                          className="rounded-lg bg-[#17120D] px-3 py-1.5 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
                        >
                          Promote
                        </button>
                      )}
                      {canPromoteOfficer && m.role === "officer" && (
                        <button
                          disabled={busyId === m.userId?._id}
                          onClick={() => run(promoteMember(m.userId._id, "member"), { loading: "Demoting…", success: "Demoted to Member" })}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Demote
                        </button>
                      )}
                      {role === "leader" && m.role !== "leader" && m.role !== "acting_leader" && m.role !== "ex_member" && (
                        <button
                          disabled={busyId === m.userId?._id}
                          onClick={() => run(promoteMember(m.userId._id, "acting_leader"), { loading: "Assigning…", success: "Acting Leader assigned" })}
                          className="rounded-lg border border-[#E3A012]/50 bg-[#FFFBEF] px-3 py-1.5 text-xs font-semibold text-[#8a5200] hover:bg-[#FFF6DC] disabled:opacity-50"
                        >
                          Make Acting Leader
                        </button>
                      )}
                      {m.role !== "leader" && m.role !== "acting_leader" && (
                        <button
                          disabled={busyId === m.userId?._id}
                          onClick={() =>
                            run(processMemberAction("kick", m.userId._id), {
                              loading: role === "officer" ? "Submitting to officer vote…" : "Removing…",
                              success: role === "officer" ? "Submitted to officer vote" : "Member removed",
                            })
                          }
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          Kick
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {exMembers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">Ex-members ({exMembers.length})</h2>
              <ul className="divide-y divide-[#F3EADA] rounded-xl border border-[#EDE1CB] bg-white">
                {exMembers.map((m) => (
                  <li key={m._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17120D] truncate">{m.userId?.name ?? "Player"}</p>
                      <p className="text-[11px] text-slate-400">
                        Removed {m.removedAt ? new Date(m.removedAt).toLocaleDateString() : ""} — data retained
                      </p>
                    </div>
                    {canManage && (
                      <button
                        disabled={busyId === m.userId?._id}
                        onClick={() =>
                          run(deleteExMember(m.userId._id), {
                            loading: "Deleting data…",
                            success: "Ex-member data permanently deleted",
                          })
                        }
                        className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                      >
                        Permanently delete data
                      </button>
                    )}
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