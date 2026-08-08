import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiTrophyFill, PiUsersFill } from "react-icons/pi";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { getGuildLeaderboard, getPlayerLeaderboard } from "../services/api/leaderboardApi";

export default function LeaderboardPage() {
  const [guilds, setGuilds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#17120D]">Leaderboards</h1>
        <p className="text-sm text-slate-500 mt-1">Ranked by guild and player scores.</p>
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
                <span className={`w-8 text-center text-sm font-bold ${i < 3 ? "text-[#E3A012]" : "text-slate-400"}`}>
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
        </div>
        {players.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No players ranked yet.</p>
        ) : (
          <ul className="divide-y divide-[#F3EADA]">
            {players.map((m, i) => (
              <li key={m._id} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-8 text-center text-sm font-bold ${i < 3 ? "text-[#E3A012]" : "text-slate-400"}`}>
                  {i + 1}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                  {m.userId?.name?.charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#17120D] truncate">{m.userId?.name ?? "Player"}</p>
                  <p className="text-[11px] font-mono text-slate-400">Guild {m.guildUid}</p>
                </div>
                <span className="text-sm font-bold text-[#17120D]">{m.score?.toLocaleString() ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}