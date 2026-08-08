import { FiTrendingUp, FiZap, FiSliders, FiCircle, FiStar } from "react-icons/fi";
import ModeStatsCard from "./ModStatus";
import type { PlayerStats } from "./Types";

function SeasonStatsSection({ stats }: { stats: PlayerStats }) {
  return (
    <div className="space-y-3">
      <ModeStatsCard
        icon={FiTrendingUp}
        title="BR Rank Match"
        stats={stats.brRank}
        rankPointsIcon={FiCircle}
      />
      <ModeStatsCard
        icon={FiZap}
        title="CS Rank Match"
        stats={stats.csRank}
        rankPointsIcon={FiStar}
        rankPointsLabel="Star"
      />
      <ModeStatsCard
        icon={FiSliders}
        title="Clash Squad (Custom) Match"
        stats={stats.clashSquadCustom}
      />
    </div>
  );
}

export default SeasonStatsSection;