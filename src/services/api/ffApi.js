import { apiFetch } from "./client";

export function getPlayerProfile(server, uid) {
  return apiFetch(`/ff/player/profile?server=${server}&uid=${uid}`, {
    method: "GET",
  });
}

export function getPlayerStats(server, uid, mode = "br") {
  return apiFetch(`/ff/player/stats?server=${server}&uid=${uid}&mode=${mode}`, {
    method: "GET",
  });
}