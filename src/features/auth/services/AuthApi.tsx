import { apiFetch } from "../../../services/api/Clint";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: AuthUser;
  // No token field on purpose — the server sets it as an httpOnly cookie
  // directly on this response, it never appears in the JSON body.
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

// Useful once you add route protection (see the empty context/ folder in
// features/auth — this is what an AuthContext would call on app load).
export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me", { method: "GET" });
}