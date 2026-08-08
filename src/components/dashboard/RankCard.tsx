import type { IconType } from "react-icons";

interface RankingCardProps {
  icon: IconType;
  title: string;
  rank: number | null;
  subtitle: string;
  emptyLabel: string;
}

function RankingCard({ icon: Icon, title, rank, subtitle, emptyLabel }: RankingCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#EDE1CB] bg-white p-4 sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD873] via-[#E3A012] to-[#B9660B] text-[#17120D]">
        <Icon className="text-lg" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B5B45]">{title}</p>
        {rank !== null ? (
          <p className="text-2xl font-bold text-[#17120D] leading-tight">#{rank.toLocaleString()}</p>
        ) : (
          <p className="text-sm font-medium text-[#B3A488] leading-tight">{emptyLabel}</p>
        )}
        <p className="text-xs text-[#B3A488] truncate">{subtitle}</p>
      </div>
    </div>
  );
}

export default RankingCard;