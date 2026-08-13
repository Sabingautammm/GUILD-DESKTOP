import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle, FiUserPlus, FiSearch, FiTrash2, FiHash } from "react-icons/fi";
import { getGuildPlayers, searchGuildPlayer, addPlayerByGameUid, removeGuildPlayer } from "../../services/api/adminApi";
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        registered ? "bg-green-500/10 text-green-300" : "bg-guild-800 text-guild-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${registered ? "bg-green-400" : "bg-guild-600"}`} />
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
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

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

  const runSearch = async () => {
    setFormError("");
    if (!/^\d+$/.test(form.gameUid.trim())) {
      setFormError("Game UID must be numeric.");
      return;
    }
    setSearching(true);
    setSearchResult(null);
    try {
      const result = await searchGuildPlayer({ game: form.game, gameUid: form.gameUid.trim() });
      setSearchResult(result);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not search for player.");
    } finally {
      setSearching(false);
    }
  };

  const runAdd = async (inGameName) => {
    setFormError("");
    setBusyId("__add__");
    try {
      await toast.promise(
        addPlayerByGameUid({
          game: form.game,
          gameUid: form.gameUid.trim(),
          inGameName: inGameName || form.inGameName.trim(),
        }),
        {
          loading: "Adding player…",
          success: "Player added to guild",
          successDescription: "The roster and member count were updated.",
          error: (err) => (err instanceof ApiError ? err.message : "Could not add player."),
        }
      );
      setForm({ game: GAMES[0], gameUid: "", inGameName: "" });
      setSearchResult(null);
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
        <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-xs text-red-300">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">Guild Players</h2>
            <p className="text-xs text-guild-500 mt-1">
              {memberCount} total — {registeredCount} GUILD App Users · {notRegisteredCount} Not Registered
            </p>
          </div>
          {role !== "member" && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110"
            >
              <FiUserPlus className="text-sm" /> Add Guild Player
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="rounded-lg bg-guild-900 border border-guild-700 p-4 space-y-3">
            <label className="text-xs font-bold text-guild-300">Find a player by their in-game UID</label>
            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
              <select
                value={form.game}
                onChange={(e) => {
                  setForm((f) => ({ ...f, game: e.target.value }));
                  setSearchResult(null);
                }}
                className="rounded-lg input-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <div className="relative">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
                <input
                  inputMode="numeric"
                  value={form.gameUid}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, gameUid: e.target.value.replace(/\D/g, "") }));
                    setSearchResult(null);
                  }}
                  placeholder="Game UID (required)"
                  className="w-full input-dark rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <button
                onClick={runSearch}
                disabled={searching || !form.gameUid.trim()}
                className="rounded-lg gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110 disabled:opacity-50"
              >
                {searching ? "Searching…" : "Search Player"}
              </button>
            </div>

            {formError && <p className="text-xs text-red-400">{formError}</p>}

            {searchResult && (
              <div className="rounded-lg border border-gold-500/30 bg-guild-900 p-4 space-y-3">
                {searchResult.found ? (
                  <>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-cream">{searchResult.user.inGameName || searchResult.user.name}</p>
                        <p className="text-[11px] text-guild-500">
                          {searchResult.user.game} · UID {searchResult.user.gameUid}
                        </p>
                      </div>
                      {searchResult.inRoster && (
                        <span className="rounded-full bg-guild-800 px-2.5 py-1 text-[10px] font-bold text-guild-400">
                          Already in this guild's roster
                        </span>
                      )}
                      {!searchResult.inRoster && searchResult.addable && (
                        <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-bold text-green-300">
                          Free Player
                        </span>
                      )}
                      {!searchResult.inRoster && !searchResult.addable && (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-300">
                          Already in a guild
                        </span>
                      )}
                    </div>

                    {!searchResult.inRoster && !searchResult.addable && searchResult.currentGuild && (
                      <p className="text-xs text-guild-500">
                        Currently <span className="font-semibold text-cream">{searchResult.currentGuild.name}</span> as{" "}
                        <span className="font-semibold text-cream">{ROLE_LABEL[searchResult.currentGuild.role] ?? searchResult.currentGuild.role}</span>.
                        This player must leave that guild before being added here.
                      </p>
                    )}

                    {searchResult.inRoster && (
                      <p className="text-xs text-guild-500">This Game UID is already on this guild's roster.</p>
                    )}

                    {!searchResult.inRoster && searchResult.addable && (
                      <button
                        onClick={() => runAdd(searchResult.user.inGameName)}
                        disabled={busyId === "__add__"}
                        className="rounded-lg gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110 disabled:opacity-50"
                      >
                        {busyId === "__add__" ? "Adding…" : "Add to Guild"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-cream">No App User Found</p>
                        <p className="text-[11px] text-guild-500">
                          This player has not created an account in the application. You can still add them to the guild
                          roster as a game-only player — they can link their account later.
                        </p>
                      </div>
                      {searchResult.inRoster && (
                        <span className="rounded-full bg-guild-800 px-2.5 py-1 text-[10px] font-bold text-guild-400">
                          Already in roster
                        </span>
                      )}
                    </div>
                    {!searchResult.inRoster && (
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          value={form.inGameName}
                          onChange={(e) => setForm((f) => ({ ...f, inGameName: e.target.value }))}
                          placeholder="In-Game Name (optional)"
                          className="min-w-0 flex-1 input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                        <button
                          onClick={() => runAdd(form.inGameName.trim())}
                          disabled={busyId === "__add__"}
                          className="rounded-lg gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110 disabled:opacity-50"
                        >
                          {busyId === "__add__" ? "Adding…" : "Add as game-only player"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by in-game name or UID…"
              className="w-full input-dark rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  statusFilter === f.key ? "gold-gradient-bg text-guild-950" : "bg-guild-800 text-guild-400 hover:bg-guild-700"
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
          <FiLoader className="animate-spin text-2xl text-gold-400" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-guild-500">No players match your filters yet.</p>
      ) : (
        <ul className="divide-y divide-guild-800 rounded-xl card-surface">
          {filtered.map((p) => {
            const displayName = p.inGameName || p.userId?.name || "Player";
            return (
              <li key={p._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-sm font-bold text-gold-400 ring-1 ring-gold-500/30">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-cream truncate">{displayName}</p>
                    <p className="text-[11px] text-guild-500">
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
                      className="rounded-lg border border-guild-600 p-1.5 text-guild-500 hover:bg-red-950/60 hover:text-red-300 disabled:opacity-50"
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