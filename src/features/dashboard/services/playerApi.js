import { apiFetch } from "../../../services/api/client";

export async function getMyProfile() {
  return apiFetch("/players/me");
}

export async function updateMyProfile(payload) {
  return apiFetch("/players/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
