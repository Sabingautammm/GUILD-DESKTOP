import { FiActivity, FiTarget, FiAward, FiCalendar } from "react-icons/fi";

export default function ModeStatsCard({ icon: Icon, title, stats, rankPointsIcon: RankIcon, rankPointsLabel = "Points" }) {
  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20">
            <Icon className="text-sm" />
          </span>
          <span className="text-sm font-bold text-cream">{title}</span>
        </div>

        {stats.rankPoints !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full gold-gradient-bg px-2.5 py-1 text-[11px] font-bold text-guild-950">
            {RankIcon && <RankIcon className="text-xs" />}
            {stats.stars != null ? `\u2605 ${stats.stars}` : `${stats.rankPoints.toLocaleString()}`} {stats.stars != null ? "" : rankPointsLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric icon={FiCalendar} label="Matches" value={(stats.matches ?? 0).toLocaleString()} />
        <Metric icon={FiActivity} label="K/D" value={(stats.kd ?? 0).toFixed(2)} />
        <Metric icon={FiTarget} label="Headshot" value={`${(stats.headshotRate ?? 0).toFixed(1)}%`} />
        <Metric icon={FiAward} label="Win Rate" value={`${(stats.winRate ?? 0).toFixed(1)}%`} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-guild-400 mb-1">
        <Icon className="text-xs shrink-0" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-base font-bold text-cream">{value}</p>
    </div>
  );
}