import { apiFetch } from "../../../services/api/client";

export function getMembers() {
  return apiFetch("/members/members");
}

export function getMemberById(id) {
  return apiFetch(`/members/members/${id}`);
}