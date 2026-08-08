import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutApi } from "../../../services/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [guild, setGuild] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
      setMembership(data.membership);
      setGuild(data.guild);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setMembership(null);
      setGuild(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore logout errors
    }
    setUser(null);
    setMembership(null);
    setGuild(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Only compute membership role for clarity of use
  const role = membership ? membership.role : "free";
  const isAdmin = ["leader", "acting_leader", "officer"].includes(role);

  const value = {
    user,
    membership,
    guild,
    role,
    isAdmin,
    isAuthenticated,
    isLoading,
    refresh,
    logout,
    setMembership,
    setGuild,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}