import { apiFetch } from "../../../services/api/Clint";
import type { PlayerProfile } from "../../../components/dashboard/Types";

/**
 * Fetches the logged-in player's profile (identity, guild, stats, rankings).
 * Uses the shared apiFetch() from services/api/Clint.ts — same auth
 * (httpOnly cookie via credentials: "include") and error handling
 * (ApiError with a status + friendly message) as the rest of the app.
 */
export async function getMyProfile(): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>("/players/me");
}