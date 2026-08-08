import { FiActivity, FiTarget, FiAward, FiCalendar } from "react-icons/fi";

export default function ModeStatsCard({ icon: Icon, title, stats, rankPointsIcon: RankIcon, rankPointsLabel = "Points" }) {
  return (
    <div className="rounded-xl border border-[#EDE1CB] bg-[#FAF6EE] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3A012]/10 text-[#B9660B]">
            <Icon className="text-sm" />
          </span>
          <span className="text-sm font-semibold text-[#17120D]">{title}</span>
        </div>

        {stats.rankPoints !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#17120D] px-2.5 py-1 text-[11px] font-semibold text-[#FFD873]">
            {RankIcon && <RankIcon className="text-xs" />}
            {stats.rankPoints.toLocaleString()} {rankPointsLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric icon={FiCalendar} label="Matches" value={stats.matches.toLocaleString()} />
        <Metric icon={FiActivity} label="K/D" value={stats.kd.toFixed(2)} />
        <Metric icon={FiTarget} label="Headshot" value={`${stats.headshotRate.toFixed(1)}%`} />
        <Metric icon={FiAward} label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[#6B5B45] mb-1">
        <Icon className="text-xs shrink-0" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-bold text-[#17120D]">{value}</p>
    </div>
  );
}
