export function playerName(user, fallback = "Player") {
  return user?.inGameName || user?.name || fallback;
}