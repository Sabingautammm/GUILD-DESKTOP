import { apiFetch, apiUpload } from "./client";

export function getGallery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/media${query ? `?${query}` : ""}`);
}

export function uploadMediaFile(file, { category = "guild", visibility = "public" } = {}) {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("category", category);
  formData.append("visibility", visibility);
  return apiUpload("/media", formData);
}

export function uploadAvatarFile(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiUpload("/media/avatar", formData);
}

export function removeAvatar() {
  return apiFetch("/media/avatar", { method: "DELETE" });
}

export function moderateMedia(mediaId, approvalStatus) {
  return apiFetch(`/media/${mediaId}/moderate`, {
    method: "PUT",
    body: { approvalStatus },
  });
}

export function getPendingMedia() {
  return apiFetch("/media/pending");
}

export function getMyMedia() {
  return apiFetch("/media/mine");
}

export function resubmitMedia(mediaId) {
  return apiFetch(`/media/${mediaId}/resubmit`, { method: "POST" });
}

export function toggleReaction(mediaId) {
  return apiFetch(`/media/${mediaId}/react`, { method: "POST" });
}

export function addComment(mediaId, text) {
  return apiFetch(`/media/${mediaId}/comment`, {
    method: "POST",
    body: { text },
  });
}