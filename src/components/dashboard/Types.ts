export type PlayerRole = "leader" | "acting_leader" | "officer" | "member" | "free";

export interface ModeStats {
  matches: number;
  kd: number;
  headshotRate: number; // percent, 0-100
  winRate: number; // percent, 0-100
  rankPoints?: number; // ranked modes only — Clash Squad (Custom) has none
}

export interface PlayerStats {
  brRank: ModeStats;
  csRank: ModeStats;
  clashSquadCustom: ModeStats;
}

export interface PlayerProfile {
  personalUid: string;
  inGameName: string;
  role: PlayerRole;
  guildUid: string | null;
  guildName: string | null;
  playerRank: number | null;
  guildRank: number | null;
  stats: PlayerStats;
}

export const ROLE_LABEL: Record<PlayerRole, string> = {
  leader: "Leader",
  acting_leader: "Acting Leader",
  officer: "Officer",
  member: "Member",
  free: "Free Player",
};

// Placeholder data shaped exactly like PlayerProfile — swap this for a real
// fetch (e.g. GET /players/me, following the pattern in features/auth/services/AuthApi.tsx)
// once that endpoint exists. Every consumer below only depends on the type,
// not on this being mock data.
export const MOCK_PLAYER: PlayerProfile = {
  personalUid: "1806252625",
  inGameName: "Desert7x",
  role: "leader",
  guildUid: "14556656",
  guildName: "7x Esport",
  playerRank: 1,
  guildRank: 1,
  stats: {
    brRank: {
      matches: 182,
      kd: 11.12,
      headshotRate: 97.2,
      winRate: 66.4,
      rankPoints: 60120,
    },
    csRank: {
      matches: 96,
      kd: 10.31,
      headshotRate: 95.8,
      winRate: 80.6,
      rankPoints: 521,
    },
    clashSquadCustom: {
      matches: 50,
      kd: 3.94,
      headshotRate: 35.0,
      winRate: 14.0,
    },
  },
};