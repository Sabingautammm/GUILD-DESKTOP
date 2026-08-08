import { apiFetch } from "../../../services/api/client";

export async function getMyProfile() {
  return apiFetch("/players/me");
}
