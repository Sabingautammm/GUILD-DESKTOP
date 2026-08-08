import { useEffect, useState, useCallback } from "react";
import { getMyProfile } from "../services/playerApi";

export function usePlayerProfile({ enabled = true } = {}) {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPlayer(null);
      setError(null);
      setIsLoading(false);
      return undefined;
    }
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
  }, [reloadKey, enabled]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);
  return { player, isLoading, error, refetch };
}
