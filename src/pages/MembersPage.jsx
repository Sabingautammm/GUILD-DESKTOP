import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUsers, FiLoader, FiAlertCircle, FiShield, FiClock } from "react-icons/fi";
import { getGuildLeaderboard } from "../services/api/leaderboardApi";
import { useAuth } from "../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../features/dashboard/data/playerTypes";

export default function MembersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, membership, guild, isAdmin } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getGuildLeaderboard()
      .then((d) => !cancelled && setGuilds(Array.isArray(d) ? d : []))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load guilds."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = guilds.filter(
    (g) =>
      (!query || g.guildUid.includes(query.replace(/\D/g, ""))) &&
      (!query || g.name.toLowerCase().includes(query.toLowerCase()))
  );

  const isFree = isAuthenticated && role === "free";

  if (membership && membership.status === "pending_approval") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-up">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/30">
          <FiClock className="text-2xl" />
        </span>
        <h1 className="mt-4 text-xl font-display text-cream">Application pending</h1>
        <p className="mt-2 text-sm text-guild-400">
          Your request to join guild <span className="font-mono font-semibold text-gold-300">{membership.guildUid}</span> is awaiting
          approval by the guild's admins.
        </p>
      </div>
    );
  }

  if (membership && membership.status === "active") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 animate-fade-up">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-guild-900 via-guild-850 to-guild-900 ring-1 ring-gold-500/30 p-8 text-cream">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold-500/10 blur-3xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400">Your Guild</p>
          <h1 className="relative mt-2 text-2xl font-display">{guild?.name ?? `Guild ${membership.guildUid}`}</h1>
          <p className="relative mt-1 text-xs font-mono text-guild-500">Guild UID {membership.guildUid}</p>
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full gold-gradient-bg px-3 py-1 text-[11px] font-bold text-guild-950">
              {ROLE_LABEL[membership.role] ?? membership.role}
            </span>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/guild/${membership.guildUid}`)}
              className="rounded-full gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 gold-glow hover:brightness-110"
            >
              View your guild
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/members")}
                className="flex items-center gap-2 rounded-full border border-guild-600 px-5 py-2 text-sm font-semibold text-guild-200 hover:bg-guild-800"
              >
                <FiShield className="text-xs" /> Admin dashboard
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-guild-500">
          You're already a member of a guild — members belong to one guild at a time.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-display text-cream">Find a guild</h1>
          <p className="text-sm text-guild-400 mt-1">Search by Guild UID or name, then apply to join.</p>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Guild UID or name…"
          className="w-full rounded-full input-dark pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <FiLoader className="animate-spin text-2xl text-gold-400" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <FiAlertCircle className="mx-auto text-3xl text-gold-400" />
          <p className="mt-3 text-sm font-semibold text-cream">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-guild-500">
          No guilds found. {isAuthenticated && "Whoever creates a UID first becomes its Leader."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((g) => (
            <button
              key={g._id}
              onClick={() => navigate(`/guild/${g.guildUid}`)}
              className="text-left card-surface p-5 hover:border-gold-500/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-lg font-bold text-gold-400 ring-1 ring-gold-500/30">
                  {g.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-cream truncate">{g.name}</p>
                  <p className="text-[11px] font-mono text-guild-500">UID {g.guildUid}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-guild-400 line-clamp-2">{g.slogan}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-guild-500 flex items-center gap-1">
                  <FiUsers /> {g.memberCount ?? "…"} active
                </span>
                {isFree && (
                  <span className="rounded-full gold-gradient-bg px-2.5 py-1 text-[11px] font-bold text-guild-950">
                    Apply
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
