import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiTrophyFill, PiUsersFill } from "react-icons/pi";
import { FiAlertCircle, FiRefreshCw, FiChevronRight, FiWifi, FiWifiOff } from "react-icons/fi";
import PlayerIdCard from "../features/dashboard/components/PlayerIDCard";
import SeasonStatsSection from "../features/dashboard/components/SeasonStatus";
import RankingCard from "../features/dashboard/components/RankCard";
import { usePlayerProfile } from "../features/dashboard/hooks/usePlayerProfile";
import { usePlayerStatsSocket } from "../hooks/usePlayerStatsSocket";
import { getGuildLeaderboard } from "../services/api/leaderboardApi";
import { getGallery } from "../services/api/mediaApi";
import { useAuth } from "../features/auth/context/AuthContext";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { player, isLoading, error, refetch } = usePlayerProfile({ enabled: isAuthenticated });
  const { stats: socketStats, isConnected } = usePlayerStatsSocket(user?.id, isAuthenticated);
  const [topGuilds, setTopGuilds] = useState([]);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [feedError, setFeedError] = useState(null);

  // Merge REST API stats with WebSocket updates (WebSocket takes precedence)
  const mergedStats = player?.stats ? {
    ...player.stats,
    ...socketStats,
  } : socketStats;

  useEffect(() => {
    let cancelled = false;
    Promise.all([getGuildLeaderboard(), getGallery({ limit: 3 })])
      .then(([g, m]) => {
        if (cancelled) return;
        setTopGuilds(Array.isArray(g) ? g.slice(0, 5) : []);
        setPreviewMedia(Array.isArray(m) ? m.slice(0, 3) : []);
      })
      .catch((err) => !cancelled && setFeedError(err instanceof Error ? err.message : null));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-guild-900 p-8 sm:p-12 text-center animate-fade-up">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-600/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400">
              GUILD · Fantasy Memberships
            </p>
            <h1 className="mt-4 text-3xl sm:text-5xl font-display text-cream leading-tight">
              Find your guild, <span className="gold-gradient-text">rule it or join it.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-guild-300 max-w-md mx-auto">
              Create a guild community with your UID, apply to join existing ones, and climb the
              leaderboard with your squad.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full gold-gradient-bg px-6 py-2.5 text-sm font-bold text-guild-950 gold-glow hover:brightness-110 transition-all active:scale-[0.97]"
              >
                Get started with Google
              </Link>
              <Link
                to="/leaderboard"
                className="rounded-full border border-guild-600 px-6 py-2.5 text-sm font-semibold text-guild-200 hover:bg-guild-800 hover:border-gold-500/40 transition-colors"
              >
                Browse leaderboards
              </Link>
            </div>
          </div>
        </section>
        <LeagueTable topGuilds={topGuilds} feedError={feedError} />
        <MediaPreviewCard previewMedia={previewMedia} feedError={feedError} />
      </div>
    );
  }

  if (isLoading) {
    return <HomepageSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
          <FiAlertCircle className="text-2xl" />
        </span>
        <p className="text-sm font-semibold text-cream">Couldn't load your profile</p>
        <p className="text-xs text-guild-400 max-w-xs">{error ?? "Something went wrong."}</p>
        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110"
        >
          <FiRefreshCw className="text-xs" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <PlayerIdCard player={player} />

      <section className="animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-400">
            Season Stats
          </h2>
          <span className={`inline-flex items-center gap-1 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? <FiWifi className="text-xs" /> : <FiWifiOff className="text-xs" />}
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <SeasonStatsSection stats={mergedStats} />
      </section>

      <section className="animate-fade-up">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-400 mb-3">
          Rankings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RankingCard
            icon={PiTrophyFill}
            title="Player Ranking"
            rank={player.playerRank}
            subtitle="Global player leaderboard"
            emptyLabel="Unranked"
          />
          <RankingCard
            icon={PiUsersFill}
            title="Guild Ranking"
            rank={player.guildRank}
            subtitle={player.guildName ?? "Join a guild to get ranked"}
            emptyLabel="Not applicable"
          />
        </div>
      </section>

      <LeagueTable topGuilds={topGuilds} feedError={feedError} />

      <MediaPreviewCard previewMedia={previewMedia} feedError={feedError} />
    </div>
  );
}

function LeagueTable({ topGuilds, feedError }) {
  return (
    <section className="card-surface p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">
          Top Guilds
        </h2>
        <Link to="/leaderboard" className="inline-flex items-center gap-1 text-xs font-bold text-gold-400 hover:text-gold-300">
          View all <FiChevronRight />
        </Link>
      </div>
      {feedError ? (
        <p className="text-xs text-guild-500">{feedError}</p>
      ) : topGuilds.length === 0 ? (
        <p className="text-xs text-guild-500">No guilds on the leaderboard yet.</p>
      ) : (
        <ul className="divide-y divide-guild-800">
          {topGuilds.map((g, i) => (
            <li key={g._id}>
              <Link to={`/guild/${g.guildUid}`} className="flex items-center gap-3 py-2.5 group">
                <span className={`w-6 text-center text-xs font-bold ${i < 3 ? "text-gold-400" : "text-guild-600"}`}>
                  {i + 1}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-400 ring-1 ring-gold-500/20">
                  {g.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-cream truncate group-hover:text-gold-300">
                    {g.name}
                  </span>
                  <span className="block text-[10px] font-mono text-guild-500">UID {g.guildUid}</span>
                </span>
                <span className="text-sm font-bold text-cream">{g.score.toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MediaPreviewCard({ previewMedia, feedError }) {
  return (
    <section className="card-surface p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-guild-300">
          Latest Media
        </h2>
        <Link to="/gallery" className="inline-flex items-center gap-1 text-xs font-bold text-gold-400 hover:text-gold-300">
          Open gallery <FiChevronRight />
        </Link>
      </div>
      {feedError ? (
        <p className="text-xs text-guild-500">{feedError}</p>
      ) : previewMedia.length === 0 ? (
        <p className="text-xs text-guild-500">No approved media yet. Uploads appear after admin approval.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {previewMedia.map((m) => (
            <Link
              key={m._id}
              to="/gallery"
              className="aspect-video rounded-lg bg-guild-950 overflow-hidden flex items-center justify-center ring-1 ring-guild-700 hover:ring-gold-500/40 transition-all"
            >
              {m.type === "video" ? (
                <video src={resolveMediaUrl(m.url)} className="w-full h-full object-contain" muted playsInline />
              ) : (
                <img src={resolveMediaUrl(m.url)} alt="Media preview" className="w-full h-full object-contain" />
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function HomepageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-pulse">
      <div className="h-48 rounded-2xl bg-guild-800" />
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-guild-800" />
        <div className="h-28 rounded-xl bg-guild-850" />
        <div className="h-28 rounded-xl bg-guild-850" />
        <div className="h-28 rounded-xl bg-guild-850" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-guild-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-guild-850" />
          <div className="h-20 rounded-xl bg-guild-850" />
        </div>
      </div>
    </div>
  );
}