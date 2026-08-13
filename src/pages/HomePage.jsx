import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiTrophyFill, PiUsersFill } from "react-icons/pi";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import PlayerIdCard from "../features/dashboard/components/PlayerIDCard";
import SeasonStatsSection from "../features/dashboard/components/SeasonStatus";
import RankingCard from "../features/dashboard/components/RankCard";
import { usePlayerProfile } from "../features/dashboard/hooks/usePlayerProfile";
import { getGuildLeaderboard } from "../services/api/leaderboardApi";
import { getGallery } from "../services/api/mediaApi";
import { useAuth } from "../features/auth/context/AuthContext";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { player, isLoading, error, refetch } = usePlayerProfile({ enabled: isAuthenticated });
  const [topGuilds, setTopGuilds] = useState([]);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [feedError, setFeedError] = useState(null);

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
        <section className="rounded-2xl bg-gradient-to-br from-[#17120D] via-[#2A2118] to-[#17120D] p-8 sm:p-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFD873]">GUILD · Fantasy Memberships</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white">
            Find your guild, <span className="text-[#FFD873]">rule it or join it.</span>
          </h1>
          <p className="mt-3 text-sm text-white/70 max-w-md mx-auto">
            Create a guild community with your UID, apply to join existing ones, and climb the leaderboard with your squad.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] px-6 py-2.5 text-sm font-bold text-[#17120D] hover:brightness-105"
            >
              Get started with Google
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse leaderboards
            </Link>
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
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B9660B]/10 text-[#B9660B]">
          <FiAlertCircle className="text-2xl" />
        </span>
        <p className="text-sm font-semibold text-[#17120D]">Couldn't load your profile</p>
        <p className="text-xs text-[#6B5B45] max-w-xs">{error ?? "Something went wrong."}</p>
        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90"
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

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">
          Season Stats
        </h2>
        <SeasonStatsSection stats={player.stats} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-3">
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
    <section className="rounded-xl border border-[#EDE1CB] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">
          Top Guilds
        </h2>
        <Link to="/leaderboard" className="text-xs font-semibold text-[#B9660B] hover:underline">
          View all →
        </Link>
      </div>
      {feedError ? (
        <p className="text-xs text-slate-400">{feedError}</p>
      ) : topGuilds.length === 0 ? (
        <p className="text-xs text-slate-400">No guilds on the leaderboard yet.</p>
      ) : (
        <ul className="divide-y divide-[#F3EADA]">
          {topGuilds.map((g, i) => (
            <li key={g._id}>
              <Link to={`/guild/${g.guildUid}`} className="flex items-center gap-3 py-2.5 group">
                <span className={`w-6 text-center text-xs font-bold ${i < 3 ? "text-[#E3A012]" : "text-slate-300"}`}>
                  {i + 1}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3A012]/10 text-xs font-bold text-[#B9660B]">
                  {g.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#17120D] truncate group-hover:underline">
                    {g.name}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400">UID {g.guildUid}</span>
                </span>
                <span className="text-sm font-bold text-[#17120D]">{g.score.toLocaleString()}</span>
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
    <section className="rounded-xl border border-[#EDE1CB] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">
          Latest Media
        </h2>
        <Link to="/gallery" className="text-xs font-semibold text-[#B9660B] hover:underline">
          Open gallery →
        </Link>
      </div>
      {feedError ? (
        <p className="text-xs text-slate-400">{feedError}</p>
      ) : previewMedia.length === 0 ? (
        <p className="text-xs text-slate-400">No approved media yet. Uploads appear after admin approval.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {previewMedia.map((m) => (
            <Link
              key={m._id}
              to="/gallery"
              className="aspect-video rounded-lg bg-black overflow-hidden flex items-center justify-center"
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
      <div className="h-48 rounded-2xl bg-[#EDE1CB]/60" />
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-[#EDE1CB]/60" />
        <div className="h-28 rounded-xl bg-[#EDE1CB]/40" />
        <div className="h-28 rounded-xl bg-[#EDE1CB]/40" />
        <div className="h-28 rounded-xl bg-[#EDE1CB]/40" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-[#EDE1CB]/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-[#EDE1CB]/40" />
          <div className="h-20 rounded-xl bg-[#EDE1CB]/40" />
        </div>
      </div>
    </div>
  );
}