import { apiFetch } from "./client";

export function getNotifications() {
  return apiFetch("/notifications");
}

export function getUnreadCount() {
  return apiFetch("/notifications/unread-count");
}

export function markAllRead() {
  return apiFetch("/notifications/read", { method: "PUT" });
}

export function markRead(ids) {
  return apiFetch("/notifications/read", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
}