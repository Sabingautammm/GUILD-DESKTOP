export default function RankingCard({ icon: Icon, title, rank, subtitle, emptyLabel }) {
  return (
    <div className="flex items-center gap-4 card-surface p-4 sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gold-gradient-bg text-guild-950">
        <Icon className="text-lg" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-guild-400">{title}</p>
        {rank != null ? (
          <p className="text-2xl font-display text-cream leading-tight">#{rank.toLocaleString()}</p>
        ) : (
          <p className="text-sm font-medium text-guild-500 leading-tight">{emptyLabel}</p>
        )}
        <p className="text-xs text-guild-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}