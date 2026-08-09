import { apiFetch } from "./client";

export function googleLogin(idToken) {
  return apiFetch("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function leaderLogin(guildUid, password) {
  return apiFetch("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ guildUid, password }),
  });
}

export function checkGuildUid(guildUid) {
  return apiFetch("/auth/onboarding/guild-uid", {
    method: "POST",
    body: JSON.stringify({ guildUid }),
  });
}

export function createGuild(payload) {
  return apiFetch("/auth/onboarding/create-guild", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function selectGame(game) {
  return apiFetch("/auth/onboarding/game", {
    method: "POST",
    body: JSON.stringify({ game }),
  });
}

export function submitGameIdentity(gameUid, inGameName) {
  return apiFetch("/auth/onboarding/game-identity", {
    method: "POST",
    body: JSON.stringify({ gameUid, inGameName }),
  });
}

export function verifyLeaderPassword(password) {
  return apiFetch("/auth/onboarding/verify-leader", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function completeOnboarding() {
  return apiFetch("/auth/onboarding/complete", { method: "POST" });
}

export function getCurrentUser() {
  return apiFetch("/auth/me", { method: "GET" });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}