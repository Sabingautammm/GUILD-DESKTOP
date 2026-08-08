import { FiHash, FiShield, FiUsers } from "react-icons/fi";
import { ROLE_LABEL, type PlayerProfile } from "./Types";

interface PlayerIdCardProps {
  player: PlayerProfile;
}

function PlayerIdCard({ player }: PlayerIdCardProps) {
  const { personalUid, inGameName, role, guildUid, guildName } = player;
  const initial = inGameName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] shadow-xl shadow-[#17120D]/20">
      {/* Decorative circles — same device used in Overlay.tsx for visual continuity */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FFD873]/10" />
      <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />

      <div className="relative p-5 sm:p-7">
        {/* Eyebrow + role pill */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#FFD873]/80">
            Player ID
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[11px] font-medium text-[#FFD873] ring-1 ring-white/10">
            <FiShield className="text-xs" />
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold text-[#FFD873] ring-1 ring-white/10">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl sm:text-2xl font-bold text-white">{inGameName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[#FFD873]/70">
              <FiHash className="text-xs shrink-0" />
              <span className="font-mono text-xs sm:text-sm tracking-[0.15em]">{personalUid}</span>
            </div>
          </div>
        </div>

        {/* Perforated divider, like a tear-off badge */}
        <div className="border-t border-dashed border-white/15 mb-4" />

        {/* Guild affiliation */}
        <div className="flex items-center gap-2 text-sm">
          <FiUsers className="text-[#FFD873]/70 shrink-0" />
          {guildUid ? (
            <p className="text-white/80 truncate">
              <span className="font-semibold text-white">{guildName}</span>
              <span className="text-white/50"> · UID {guildUid}</span>
            </p>
          ) : (
            <p className="text-white/50">Not affiliated with a guild</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerIdCard;