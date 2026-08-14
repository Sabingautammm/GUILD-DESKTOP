import { apiFetch } from "./client";

export function getPlayerProfile(server, uid) {
  return apiFetch(`/ff/player/profile?server=${server}&uid=${uid}`, {
    method: "GET",
  });
}

export function getPlayerBRStats(server, uid) {
  return apiFetch(`/ff/player/stats?server=${server}&uid=${uid}&mode=br`, {
    method: "GET",
  });
}

export function getPlayerCSStats(server, uid) {
  return apiFetch(`/ff/player/stats?server=${server}&uid=${uid}&mode=cs`, {
    method: "GET",
  });
}