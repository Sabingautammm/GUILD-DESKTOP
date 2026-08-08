import { apiFetch } from "./client";

export function getGuildProfile(guildUid) {
  return apiFetch(`/guild/${guildUid}`);
}

export function getPrivateGuildView(guildUid) {
  return apiFetch(`/guild/${guildUid}/private`);
}

export function updateGuild(guildUid, payload) {
  return apiFetch(`/guild/${guildUid}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function applyToGuild(guildUid) {
  return apiFetch(`/guild/${guildUid}/apply`, { method: "POST" });
}

export function leaveGuild(guildUid) {
  return apiFetch(`/guild/${guildUid}/leave`, { method: "POST" });
}

export function disbandGuild(guildUid) {
  return apiFetch(`/guild/${guildUid}/disband`, { method: "POST" });
}