import { FiHash, FiShield, FiUsers } from "react-icons/fi";
import { ROLE_LABEL } from "../data/playerTypes";

export default function PlayerIdCard({ player }) {
  const { personalUid, inGameName, role, guildUid, guildName } = player;
  const initial = inGameName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-guild-900 via-guild-850 to-guild-900 ring-1 ring-gold-500/25 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-500/15 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-gold-600/10 translate-y-1/2 -translate-x-1/3 blur-2xl" />

      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-400">
            Player ID
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 backdrop-blur px-3 py-1 text-[11px] font-bold text-gold-300 ring-1 ring-gold-500/30">
            <FiShield className="text-xs" />
            {ROLE_LABEL[role]}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-2xl font-bold text-guild-950 gold-glow">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl sm:text-2xl font-display text-cream">{inGameName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-gold-400/90">
              <FiHash className="text-xs shrink-0" />
              <span className="font-mono text-xs sm:text-sm tracking-[0.15em]">{personalUid}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-guild-600 mb-4" />

        <div className="flex items-center gap-2 text-sm">
          <FiUsers className="text-gold-400 shrink-0" />
          {guildUid ? (
            <p className="text-guild-300 truncate">
              <span className="font-bold text-cream">{guildName}</span>
              <span className="text-guild-500"> · UID {guildUid}</span>
            </p>
          ) : (
            <p className="text-guild-500">Not affiliated with a guild</p>
          )}
        </div>
      </div>
    </div>
  );
}