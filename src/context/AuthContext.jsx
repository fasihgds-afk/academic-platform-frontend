import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

const PANEL_ROLES = ["admin", "salesAgent", "writer"];
const STORAGE_KEY = "tutorspath_admin_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await api.me(token);
        const nextUser = res.data.user;

        if (!PANEL_ROLES.includes(nextUser.role)) {
          throw new Error("This account cannot access the admin panel");
        }

        if (!cancelled) {
          setUser(nextUser);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    setError("");
    const res = await api.login(email, password);
    const nextUser = res.data.user;

    if (!PANEL_ROLES.includes(nextUser.role)) {
      throw new Error("Only admin, sales agents, and writers can sign in here");
    }

    localStorage.setItem(STORAGE_KEY, res.data.token);
    setToken(res.data.token);
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isSales: user?.role === "salesAgent",
        isWriter: user?.role === "writer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
