import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import {
  getToken,
  setToken,
  getUser,
  setUser as persistUser,
  clearSession,
} from "../utils/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);

  // `initialising` gates the router: without it, a refresh on a protected
  // route flashes /login for a frame before storage is read.
  const [initialising, setInitialising] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setInitialising(false);
  }, []);

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    persistUser(nextUser);
    setTokenState(nextToken);
    setUserState(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      setBusy(true);
      try {
        const { token: nextToken, user: nextUser } = await authService.login(credentials);
        persist(nextToken, nextUser);
        return nextUser;
      } finally {
        setBusy(false);
      }
    },
    [persist]
  );

  const signup = useCallback(
    async (credentials) => {
      setBusy(true);
      try {
        const { token: nextToken, user: nextUser } = await authService.signup(credentials);
        persist(nextToken, nextUser);
        return nextUser;
      } finally {
        setBusy(false);
      }
    },
    [persist]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, the local session must end.
    } finally {
      clearSession();
      setTokenState(null);
      setUserState(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      initialising,
      busy,
      login,
      signup,
      logout,
    }),
    [user, token, initialising, busy, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
