import { useEffect, useState, useCallback } from "react";
import type { PlayerProfile } from "../../../components/dashboard/Types";
import { getMyProfile } from "../services/PlayerApi";

interface UsePlayerProfileResult {
  player: PlayerProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads the logged-in player's profile from the server (GET /players/me).
 * Replaces the previous MOCK_PLAYER placeholder in Homepage — every
 * dashboard component still only depends on the PlayerProfile shape.
 */
export function usePlayerProfile(): UsePlayerProfileResult {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMyProfile()
      .then((data) => {
        if (!cancelled) setPlayer(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { player, isLoading, error, refetch };
}