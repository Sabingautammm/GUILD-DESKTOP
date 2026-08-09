import { apiFetch } from "./client";

export function getRoster() {
  return apiFetch("/admin/members");
}

export function getExMembers() {
  return apiFetch("/admin/members/ex");
}

export function promoteMember(targetUserId, newRole) {
  return apiFetch("/admin/members/promote", {
    method: "POST",
    body: JSON.stringify({ targetUserId, newRole }),
  });
}

export function processMemberAction(actionType, targetUserId) {
  return apiFetch("/admin/members/action", {
    method: "POST",
    body: JSON.stringify({ actionType, targetUserId }),
  });
}

export function deleteExMember(targetUserId) {
  return apiFetch("/admin/members/ex/delete", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export function getPendingActions() {
  return apiFetch("/admin/pending-actions");
}

export function votePendingAction(actionId, vote) {
  return apiFetch(`/admin/pending-actions/${actionId}/vote`, {
    method: "POST",
    body: JSON.stringify({ vote }),
  });
}

export function initiateTransfer(targetUserId) {
  return apiFetch("/admin/transfer-leadership", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export function completeTransfer(rawToken, newPassword) {
  return apiFetch("/admin/complete-leadership-transfer", {
    method: "POST",
    body: JSON.stringify({ rawToken, newPassword }),
  });
}

export function claimLeadership() {
  return apiFetch("/admin/claim-leadership", { method: "POST" });
}

export function getActivityLogs() {
  return apiFetch("/admin/activity");
}

export function getGuildPlayers() {
  return apiFetch("/admin/guild-players");
}

export function addPlayerByGameUid(payload) {
  return apiFetch("/admin/guild-players", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeGuildPlayer(playerId) {
  return apiFetch(`/admin/guild-players/${playerId}`, {
    method: "DELETE",
  });
}