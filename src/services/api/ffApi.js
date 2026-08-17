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

export function getPlayerRank(server, uid) {
  return apiFetch(`/ff/player/rank?server=${server}&uid=${uid}`, {
    method: "GET",
  });
}

export function getPlayerFull(server, uid) {
  return apiFetch(`/ff/player/full?server=${server}&uid=${uid}`, {
    method: "GET",
  });
}

export function getGuildInfo(server, clanId) {
  return apiFetch(`/ff/guild/info?server=${server}&clanId=${clanId}`, {
    method: "GET",
  });
}

export function getGuildMembers(server, clanId) {
  return apiFetch(`/ff/guild/members?server=${server}&clanId=${clanId}`, {
    method: "GET",
  });
}

export function getPlayerGuild(server, uid) {
  return apiFetch(`/ff/player/guild?server=${server}&uid=${uid}`, {
    method: "GET",
  });
}