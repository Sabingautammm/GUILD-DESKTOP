import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiChevronDown, FiUsers } from "react-icons/fi";
import { PiTrophyFill, PiUsersFill, PiMedalFill } from "react-icons/pi";
import { getGuildLeaderboard, getPlayerLeaderboard } from "../services/api/leaderboardApi";
import { resolveMediaUrl } from "../utils/mediaUrl";
import Avatar from "../components/ui/Avatar";
import { SkeletonLeaderboard } from "../components/ui/Skeleton";

function AvatarWithFallback({ user, inGameName }) {
  const name = inGameName || user?.name || "Player";
  const src = user?.avatar ? resolveMediaUrl(user.avatar) : null;
  return (
    <Avatar
      src={src}
      name={name}
      className="h-9 w-9 shrink-0 rounded-full ring-2 ring-gold-500/30"
      fallbackClassName="bg-gold-500/10 text-gold-400"
    />
  );
}

function PlayerModeRow({ mode, stats }) {
  return (
    <div className="rounded-lg border border-guild-700 bg-guild-900 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold text-cream">{mode.title}</p>
        <p className="text-[10px] text-guild-500">{stats.rankPoints !== undefined ? `${stats.rankPoints.toLocaleString()} pts` : ""}</p>
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
      <p className="text-[9px] font-medium uppercase tracking-wide text-guild-500">{label}</p>
      <p className="text-[11px] font-bold text-cream">{value ?? 0}</p>
    </div>
  );
}

const STAT_MODES = [
  { key: "brRank", title: "BR Rank" },
  { key: "csRank", title: "CS Rank" },
  { key: "clashSquadCustom", title: "Clash Squad" },
];

const fmt = (v, d = 1) => (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

function ScoreStat({ label, value }) {
  return (
    <div className="rounded-lg bg-guild-900 border border-guild-800 px-3 py-2">
      <p className="text-[9px] font-medium uppercase tracking-wide text-guild-500">{label}</p>
      <p className="text-sm font-bold text-cream">{value}</p>
    </div>
  );
}

function rankStyleFor(i) {
  if (i === 0) return { badge: "gold-gradient-bg text-guild-950", ring: "ring-1 ring-gold-500/40 bg-guild-900" };
  if (i === 1) return { badge: "bg-guild-600 text-guild-100", ring: "bg-guild-900" };
  if (i === 2) return { badge: "bg-guild-700 text-gold-300", ring: "bg-guild-900" };
  return { badge: "bg-guild-800 text-guild-400", ring: "bg-guild-900" };
}

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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SkeletonLeaderboard count={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-gold-400" />
        <p className="mt-3 text-sm font-semibold text-cream">{error}</p>
        <p className="mt-1 text-xs text-guild-500">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-display text-cream">Leaderboards</h1>
        <p className="text-sm text-guild-400 mt-1">Ranked by season performance across BR, CS and Clash Squad.</p>
      </div>

      {guilds.length > 0 && (
        <section className="animate-fade-up">
          <div className="grid grid-cols-3 gap-3 items-end">
            {[1, 0, 2].map((pos) => {
              const g = guilds[pos];
              if (!g) return <div key={pos} />;
              const isFirst = pos === 0;
              return (
                <Link
                  key={g._id}
                  to={`/guild/${g.guildUid}`}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 sm:p-6 text-center transition-all hover:-translate-y-1 ${
                    isFirst
                      ? "border-gold-500/40 bg-gradient-to-b from-gold-500/15 to-guild-900 gold-glow"
                      : "border-guild-700 bg-guild-900 hover:border-gold-500/30"
                  }`}
                >
                  <PiMedalFill className={`text-2xl ${isFirst ? "text-gold-400" : "text-guild-600"}`} />
                  <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full gold-gradient-bg text-sm sm:text-base font-bold text-guild-950">
                    {g.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-cream truncate w-full">{g.name}</span>
                  <span className="text-[10px] font-mono text-guild-500">UID {g.guildUid}</span>
                  <span className={`font-display ${isFirst ? "text-gold-300 text-xl sm:text-2xl" : "text-cream text-base sm:text-lg"}`}>
                    {g.score.toLocaleString()}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="card-surface overflow-hidden animate-fade-up">
        <div className="flex items-center gap-2 border-b border-guild-700 px-5 py-4">
          <PiTrophyFill className="text-gold-400" />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">Top Guilds</h2>
        </div>
        {guilds.length === 0 ? (
          <p className="px-5 py-8 text-sm text-guild-500 text-center">No guilds ranked yet.</p>
        ) : (
          <ul className="divide-y divide-guild-800">
            {guilds.map((g, i) => (
              <li key={g._id} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-8 text-center text-sm font-display ${i < 3 ? "text-gold-400" : "text-guild-600"}`}>
                  {i + 1}
                </span>
                <Link to={`/guild/${g.guildUid}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-sm font-bold text-gold-400 ring-1 ring-gold-500/30">
                    {g.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-cream group-hover:text-gold-300 truncate">{g.name}</p>
                    <p className="text-[11px] font-mono text-guild-500">UID {g.guildUid}</p>
                  </div>
                </Link>
                <span className="text-sm font-bold text-cream">{g.score.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface overflow-hidden animate-fade-up">
        <div className="flex items-center gap-2 border-b border-guild-700 px-5 py-4">
          <PiUsersFill className="text-gold-400" />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">Top Players</h2>
          <span className="ml-auto text-[11px] text-guild-500">Top {Math.min(players.length, 100)} · Final Performance Score</span>
        </div>

        {players.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-guild-500">No players ranked yet.</p>
            <p className="mt-1 text-xs text-guild-500">Players appear here once they log in and record season statistics.</p>
          </div>
        ) : (
          <ul className="divide-y divide-guild-800">
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
                    <AvatarWithFallback user={p.user} inGameName={p.inGameName} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-cream truncate">{p.inGameName || p.user?.name || "Player"}</p>
                      <p className="text-[11px] text-guild-500 flex items-center gap-1 truncate">
                        {p.guildName ? (
                          <Link to={`/guild/${p.guildUid}`} className="flex items-center gap-1 hover:underline text-gold-400">
                            <FiUsers className="text-[10px]" /> {p.guildName}
                          </Link>
                        ) : (
                          <span>Free Player</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-display text-cream">{fmt(p.finalScore ?? 0)}</p>
                      <p className="text-[10px] uppercase tracking-wide text-guild-500">Score</p>
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
                      className="flex items-center justify-center gap-1 rounded-lg bg-guild-800 border border-guild-700 px-3 py-2 text-xs font-bold text-guild-300 hover:bg-guild-700"
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