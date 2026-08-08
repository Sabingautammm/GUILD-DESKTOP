import { PiTrophyFill } from "react-icons/pi";
import { HiUserGroup } from "react-icons/hi2";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import PlayerIdCard from "../dashboard/PlayerIDCard";
import SeasonStatsSection from "../dashboard/SeasonStatus";
import RankingCard from "../dashboard/RankCard";
import { usePlayerProfile } from "../../features/auth/hooks/UseplayerProfileHOMEPAGE";

function Homepage() {
  const { player, isLoading, error, refetch } = usePlayerProfile();

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
            icon={HiUserGroup}
            title="Guild Ranking"
            rank={player.guildRank}
            subtitle={player.guildName ?? "Join a guild to get ranked"}
            emptyLabel="Not applicable"
          />
        </div>
      </section>
    </div>
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

export default Homepage;