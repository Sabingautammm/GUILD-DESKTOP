import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiTrophyFill, PiUsersFill } from "react-icons/pi";
import { FiLoader, FiAlertCircle, FiChevronDown, FiUsers } from "react-icons/fi";
import { getGuildLeaderboard, getPlayerLeaderboard } from "../services/api/leaderboardApi";

const RANK_STYLES = {
  gold: { ring: "ring-2 ring-[#E3A012]/40", badge: "bg-gradient-to-br from-[#FFD873] via-[#E3A012] to-[#B9660B] text-[#17120D]", label: "bg-[#E3A012]/15 text-[#8a5200]" },
  silver: { ring: "ring-2 ring-slate-300/60", badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800", label: "bg-slate-100 text-slate-600" },
  bronze: { ring: "ring-2 ring-[#B9660B]/40", badge: "bg-gradient-to-br from-[#D98745] to-[#8a3d00] text-white", label: "bg-[#B9660B]/15 text-[#8a3d00]" },
  plain: { ring: "", badge: "bg-[#F3EADA] text-[#6B5B45]", label: "bg-slate-100 text-slate-500" },
};

const rankStyleFor = (i) =>
  i === 0 ? RANK_STYLES.gold : i === 1 ? RANK_STYLES.silver : i === 2 ? RANK_STYLES.bronze : RANK_STYLES.plain;

function ScoreStat({ label, value, sub }) {
  return (
    <div className="rounded-lg bg-[#FAF6EE] border border-[#EDE1CB] px-3 py-2 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">{label}</p>
      <p className="text-sm sm:text-base font-bold text-[#17120D]">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-mono">{sub}</p>}
    </div>
  );
}

function Avatar({ user, inGameName, size = "h-10 w-10 text-sm" }) {
  const initial = (user?.name || inGameName || "?").charAt(0).toUpperCase();
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user?.name || "avatar"}
      className={`${size} shrink-0 rounded-full object-cover ring-1 ring-[#E3A012]/30`}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#E3A012]/10 font-bold text-[#B9660B]`}>
      {initial}
    </span>
  );
}

function PlayerModeRow({ mode, stats }) {
  return (
    <div className="rounded-lg border border-[#EDE1CB] bg-white px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-semibold text-[#17120D]">{mode.title}</p>
        <p className="text-[10px] text-slate-400">{stats.rankPoints !== undefined ? `${stats.rankPoints.toLocaleString()} pts` : ""}</p>
      </div>
      <div className="grid grid-cols-4 gap-1 text-center">
        <ModeStat label="M" value={stats.matches} />
        <ModeStat label="K/D" value={stats.kd} />
        <ModeStat label="HS" value={`${stats.headshotRate}%`} />
        <ModeStat label="WR" value={`${stats.winRate}%`} />
      </div>
    </div>
  );
}

function ModeStat({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-[11px] font-bold text-[#17120D]">{value ?? 0}</p>
    </div>
  );
}

const STAT_MODES = [
  { key: "brRank", title: "BR Rank" },
  { key: "csRank", title: "CS Rank" },
  { key: "clashSquadCustom", title: "Clash Squad" },
];

const fmt = (v, d = 1) => (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

export default function LeaderboardPage() {
  const [guilds, setGuilds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all([getGuildLeaderboard(), getPlayerLeaderboard()])
      .then(([g, p]) => {
        if (cancelled) return;
        setGuilds(Array.isArray(g) ? g : []);
        setPlayers(Array.isArray(p) ? p : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load leaderboards.");
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-[#B9660B]" />
        <p className="mt-3 text-sm font-semibold text-[#17120D]">{error}</p>
        <p className="mt-1 text-xs text-slate-400">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#17120D]">Leaderboards</h1>
        <p className="text-sm text-slate-500 mt-1">Ranked by season performance across BR, CS and Clash Squad.</p>
      </div>

      <section className="rounded-xl border border-[#EDE1CB] bg-white overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#EDE1CB] px-5 py-4">
          <PiTrophyFill className="text-[#E3A012]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Top Guilds</h2>
        </div>
        {guilds.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No guilds ranked yet.</p>
        ) : (
          <ul className="divide-y divide-[#F3EADA]">
            {guilds.map((g, i) => (
              <li key={g._id} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-8 text-center text-sm font-bold ${i < 3 ? "text-[#E3A012]" : "text-slate-300"}`}>
                  {i + 1}
                </span>
                <Link to={`/guild/${g.guildUid}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                    {g.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#17120D] group-hover:underline truncate">{g.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">UID {g.guildUid}</p>
                  </div>
                </Link>
                <span className="text-sm font-bold text-[#17120D]">{g.score.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[#EDE1CB] bg-white overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#EDE1CB] px-5 py-4">
          <PiUsersFill className="text-[#E3A012]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Top Players</h2>
          <span className="ml-auto text-[11px] text-slate-400">Top {Math.min(players.length, 100)} · Final Performance Score</span>
        </div>

        {players.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400">No players ranked yet.</p>
            <p className="mt-1 text-xs text-slate-400">Players appear here once they log in and record season statistics.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F3EADA]">
            {players.map((p, i) => {
              const style = rankStyleFor(i);
              const isOpen = expanded.has(p.profileId);
              const t = p.totals || {};
              return (
                <li key={p.profileId ?? i} className={`px-4 sm:px-5 py-4 ${style.ring}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${style.badge}`}>
                      {p.rank}
                    </span>
                    <Avatar user={p.user} inGameName={p.inGameName} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#17120D] truncate">{p.inGameName || p.user?.name || "Player"}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        {p.guildName ? (
                          <Link to={`/guild/${p.guildUid}`} className="flex items-center gap-1 hover:underline text-[#B9660B]">
                            <FiUsers className="text-[10px]" /> {p.guildName}
                          </Link>
                        ) : (
                          <span>Free Player</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-[#17120D]">{fmt(p.finalScore ?? 0)}</p>
                      <p className="text-[10px] uppercase tracking-wide text-[#6B5B45]">Score</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <ScoreStat label="K/D" value={fmt(t.kd ?? 0, 2)} />
                    <ScoreStat label="Win Rate" value={`${fmt(t.winRate ?? 0, 1)}%`} />
                    <ScoreStat label="Headshot" value={`${fmt(t.headshotRate ?? 0, 1)}%`} />
                    <ScoreStat label="Matches" value={t.matches ?? 0} />
                    <ScoreStat label="Wins" value={t.wins ?? 0} />
                    <button
                      onClick={() => toggleExpanded(p.profileId)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-[#FAF6EE] border border-[#EDE1CB] px-3 py-2 text-xs font-semibold text-[#6B5B45] hover:bg-[#FFF6DC]"
                    >
                      Modes <FiChevronDown className={`text-sm transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {STAT_MODES.map((mode) => (
                        <PlayerModeRow key={mode.key} mode={mode} stats={p.stats?.[mode.key] || {}} />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}