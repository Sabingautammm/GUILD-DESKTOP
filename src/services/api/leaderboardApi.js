import { apiFetch } from "./client";

export function getGuildLeaderboard() {
  return apiFetch("/leaderboards/guilds");
}

export function getPlayerLeaderboard() {
  return apiFetch("/leaderboards/players");
}