import { apiFetch } from "./client";

export function getGallery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/media${query ? `?${query}` : ""}`);
}

export function uploadMedia(payload) {
  return apiFetch("/media", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function moderateMedia(mediaId, approvalStatus) {
  return apiFetch(`/media/${mediaId}/moderate`, {
    method: "PUT",
    body: JSON.stringify({ approvalStatus }),
  });
}

export function toggleReaction(mediaId) {
  return apiFetch(`/media/${mediaId}/react`, { method: "POST" });
}

export function addComment(mediaId, text) {
  return apiFetch(`/media/${mediaId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}