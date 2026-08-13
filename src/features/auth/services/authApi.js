import { apiFetch } from "../../../services/api/client";

// Leader standalone login (UID + password)
export function login(payload) {
  return apiFetch("/auth/admin-login", {
    method: "POST",
    body: payload,
  });
}

// Google OAuth (dev: mock token; prod: real ID token)
export function googleLogin(token) {
  return apiFetch("/auth/google", {
    method: "POST",
    body: { idToken: token },
  });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return apiFetch("/auth/me", { method: "GET" });
}