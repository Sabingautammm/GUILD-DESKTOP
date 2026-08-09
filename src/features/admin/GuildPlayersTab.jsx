import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle, FiUserPlus, FiSearch, FiTrash2, FiHash } from "react-icons/fi";
import { getGuildPlayers, addPlayerByGameUid, removeGuildPlayer } from "../../services/api/adminApi";
import { ApiError } from "../../services/api/client";
import { useToast } from "../../components/toast/ToastProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../../features/dashboard/data/playerTypes";

const GAMES = ["PUBG", "Free Fire", "Mobile Legends"];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "registered", label: "GUILD App Users" },
  { key: "not_registered", label: "Not Registered" },
  { key: "leader", label: "Leader" },
  { key: "acting_leader", label: "Acting Leader" },
  { key: "officer", label: "Officer" },
  { key: "member", label: "Members" },
];

function StatusBadge({ status }) {
  const registered = status === "registered";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        registered ? "bg-green-600/10 text-green-700" : "bg-slate-200 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${registered ? "bg-green-600" : "bg-slate-400"}`} />
      {registered ? "GUILD App User" : "Not Registered"}
    </span>
  );
}

export default function GuildPlayersTab() {
  const toast = useToast();
  const { role } = useAuth();
  const [players, setPlayers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [notRegisteredCount, setNotRegisteredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({ game: GAMES[0], gameUid: "", inGameName: "" });
  const [formError, setFormError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const reload = () => {
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    getGuildPlayers()
      .then((d) => {
        if (cancelled) return;
        setPlayers(d.players ?? []);
        setMemberCount(d.memberCount ?? 0);
        setRegisteredCount(d.registeredCount ?? 0);
        setNotRegisteredCount(d.notRegisteredCount ?? 0);
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load players."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => reload(), []);

  const runAdd = async () => {
    setFormError("");
    if (!/^\d+$/.test(form.gameUid.trim())) {
      setFormError("Game UID must be numeric.");
      return;
    }
    setBusyId("__add__");
    try {
      await toast.promise(
        addPlayerByGameUid({
          game: form.game,
          gameUid: form.gameUid.trim(),
          inGameName: form.inGameName.trim(),
        }),
        {
          loading: "Adding player…",
          success: "Player added to guild",
          successDescription: "The roster and member count were updated.",
          error: (err) => (err instanceof ApiError ? err.message : "Could not add player."),
        }
      );
      setForm({ game: GAMES[0], gameUid: "", inGameName: "" });
      setShowAddForm(false);
      reload();
    } catch {
      // toast handled it
    } finally {
      setBusyId(null);
    }
  };

  const runRemove = async (playerId) => {
    setBusyId(playerId);
    try {
      await toast.promise(removeGuildPlayer(playerId), {
        loading: "Removing…",
        success: "Player removed from roster",
        error: (err) => (err instanceof ApiError ? err.message : "Could not remove player."),
      });
      reload();
    } catch {
      // toast handled it
    } finally {
      setBusyId(null);
    }
  };

  const filtered = players.filter((p) => {
    if (statusFilter === "registered" && p.status !== "registered") return false;
    if (statusFilter === "not_registered" && p.status !== "not_registered") return false;
    if (["leader", "acting_leader", "officer", "member"].includes(statusFilter) && p.role !== statusFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const name = (p.inGameName || p.userId?.name || "").toLowerCase();
      const uid = p.gameUid || "";
      if (!name.includes(q) && !uid.includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Guild Players</h2>
            <p className="text-xs text-slate-500 mt-1">
              {memberCount} total — {registeredCount} GUILD App Users · {notRegisteredCount} Not Registered
            </p>
          </div>
          {role !== "member" && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90"
            >
              <FiUserPlus className="text-sm" /> Add Guild Player
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="rounded-lg bg-[#FAF6EE] border border-[#EDE1CB] p-4 space-y-3">
            <label className="text-xs font-semibold text-slate-800">Add a player by their in-game UID</label>
            <div className="grid sm:grid-cols-3 gap-3">
              <select
                value={form.game}
                onChange={(e) => setForm((f) => ({ ...f, game: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <div className="relative">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  inputMode="numeric"
                  value={form.gameUid}
                  onChange={(e) => setForm((f) => ({ ...f, gameUid: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Game UID (required)"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <input
                value={form.inGameName}
                onChange={(e) => setForm((f) => ({ ...f, inGameName: e.target.value }))}
                placeholder="In-Game Name (optional)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <button
              onClick={runAdd}
              disabled={busyId === "__add__"}
              className="rounded-lg bg-[#B9660B] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {busyId === "__add__" ? "Adding…" : "Add Player"}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by in-game name or UID…"
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  statusFilter === f.key ? "bg-[#17120D] text-[#FFD873]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-slate-400">No players match your filters yet.</p>
      ) : (
        <ul className="divide-y divide-[#F3EADA] rounded-xl border border-[#EDE1CB] bg-white">
          {filtered.map((p) => {
            const displayName = p.inGameName || p.userId?.name || "Player";
            return (
              <li key={p._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#17120D] truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400">
                      {p.game} · UID {p.gameUid} · {ROLE_LABEL[p.role] ?? p.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <StatusBadge status={p.status} />
                  {role !== "member" && (
                    <button
                      disabled={busyId === p._id}
                      onClick={() => runRemove(p._id)}
                      className="rounded-lg border border-slate-300 p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                      aria-label="Remove player from guild"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}