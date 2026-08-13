import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle, FiShield } from "react-icons/fi";
import { getRoster, initiateTransfer, completeTransfer, claimLeadership } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";
import { useToast } from "../../components/toast/ToastProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../../features/dashboard/data/playerTypes";
import { playerName } from "../../utils/playerName";

export default function TransferTab() {
  const toast = useToast();
  const { role, refresh } = useAuth();
  const [roster, setRoster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);

  const [rawToken, setRawToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmingTransfer, setConfirmingTransfer] = useState(null);

  const isLeader = role === "leader";
  const isActingLeader = role === "acting_leader";

  useEffect(() => {
    if (!isLeader) return;
    let cancelled = false;
    getRoster()
      .then((d) => !cancelled && setRoster(d.filter((r) => r.status === "active")))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load roster."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isLeader]);

  const eligible = roster.filter((m) => m.role === "officer" || m.role === "acting_leader");

  const handleInitiate = async () => {
    if (!targetId) return;
    setBusy(true);
    try {
      await toast.promise(initiateTransfer(targetId), {
        loading: "Generating transfer link…",
        success: "Transfer link generated",
        successDescription: "The new leader got a notification with the one-time token.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not initiate transfer."),
      });
      setTargetId("");
    } catch {
      // toast handled it
    } finally {
      setBusy(false);
    }
  };

  const handleInitiateClick = () => {
    const target = roster.find((m) => m.userId?._id === targetId);
    setConfirmingTransfer({
      name: playerName(target?.userId, "this player"),
      onConfirm: handleInitiate,
    });
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!rawToken || !newPassword) return;
    setBusy(true);
    try {
      await toast.promise(completeTransfer(rawToken.trim(), newPassword), {
        loading: "Completing transfer…",
        success: "Leadership transferred",
        successDescription: "Both old and new leaders are now signed out (session version bumped).",
        error: (err) => (err instanceof ApiError ? err.message : "Could not complete transfer."),
      });
      setRawToken("");
      setNewPassword("");
      await refresh();
    } catch {
      // toast handled it
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async () => {
    setBusy(true);
    try {
      await toast.promise(claimLeadership(), {
        loading: "Claiming leadership…",
        success: "Leadership claimed",
        successDescription: "You are now the Leader!",
        error: (err) => (err instanceof ApiError ? err.message : "Could not claim leadership."),
      });
      await refresh();
    } catch {
      // toast handled it
    } finally {
      setBusy(false);
    }
  };

  if (isLoading && isLeader) {
    return (
      <div className="py-12 flex justify-center">
        <FiLoader className="animate-spin text-2xl text-gold-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-xs text-red-300">
        <FiAlertCircle /> {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {isLeader && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FiShield className="text-gold-400" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">Transfer leadership</h2>
          </div>
          <p className="text-xs text-guild-500">
            Only <b className="text-cream">Officers</b> and the <b className="text-cream">Acting Leader</b> are eligible. The old Leader keeps full access until the
            new Leader completes setup via the one-time token (60 min expiry) — no leaderless window. Both accounts are
            signed out afterwards.
          </p>

          {eligible.length === 0 ? (
            <p className="text-xs text-guild-500">
              No eligible targets yet. Promote a member to Officer or assign an Acting Leader first.
            </p>
          ) : (
            <div className="space-y-3">
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Choose a target…</option>
                {eligible.map((m) => (
                  <option key={m._id} value={m.userId._id}>
                    {playerName(m.userId)} — {ROLE_LABEL[m.role]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleInitiateClick}
                disabled={busy || !targetId}
                className="w-full rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Generating…" : "Generate transfer link"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="card-surface p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">I am the new leader (setup)</h2>
          <p className="text-xs text-guild-500">
            Got a leadership transfer token? Anyone in the guild who holds it can complete the setup here — the token
            only works for the guild member it was issued to. Enter it with your new Leader password to swap roles.
          </p>
          <form onSubmit={handleComplete} className="space-y-3">
            <input
              value={rawToken}
              onChange={(e) => setRawToken(e.target.value)}
              placeholder="One-time token (from your notification)"
              className="w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Leader password"
              className="w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button
              type="submit"
              disabled={busy || !rawToken || !newPassword}
              className="w-full rounded-lg gold-gradient-bg py-2 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Working…" : "Complete transfer"}
            </button>
          </form>
        </div>

      {isActingLeader && (
        <div className="rounded-xl border border-gold-500/40 bg-guild-800/60 p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gold-300">Claim leadership</h2>
          <p className="text-xs text-guild-500">
            If the Leader's account is deleted or hasn't logged in for 30+ days, you can claim leadership here. This
            follows the same mechanics as a transfer (audit logged).
          </p>
          <button
            onClick={handleClaim}
            disabled={busy}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Claiming…" : "Claim Leadership"}
          </button>
        </div>
      )}

      {!isLeader && !isActingLeader && (
        <p className="text-xs text-guild-500">
          Only the Leader can initiate a transfer. If you were issued a transfer token, use the setup panel above; claim
          requires the Acting Leader role.
        </p>
      )}

      {confirmingTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmingTransfer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-guild-700 bg-guild-900 p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-display text-cream">Transfer leadership?</h3>
            <p className="text-sm text-guild-400">
              <b className="text-cream">{confirmingTransfer.name}</b> will become the new Guild Leader. You will be
              signed out everywhere (session version bumped) once they complete setup. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const { onConfirm } = confirmingTransfer;
                  setConfirmingTransfer(null);
                  onConfirm();
                }}
                disabled={busy}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Transfer
              </button>
              <button
                onClick={() => setConfirmingTransfer(null)}
                className="flex-1 rounded-lg bg-guild-700 py-2 text-sm font-semibold text-guild-100 hover:bg-guild-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}