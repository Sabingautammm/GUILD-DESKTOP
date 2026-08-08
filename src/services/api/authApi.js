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

export function getCurrentUser() {
  return apiFetch("/auth/me", { method: "GET" });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}