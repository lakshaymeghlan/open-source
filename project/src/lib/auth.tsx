// src/lib/auth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister, fetchProfile } from "./api";

type User = any | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // on mount, try to refresh profile if token present
  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        await refreshUser();
      } catch (e) {
        console.warn("Initial refreshUser failed", e);
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      // backend may return profile directly or wrapped, support both
      const profile = (data && data.user) ? data.user : data;
      setUser(profile ?? null);
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      setToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      const t = res?.token ?? res?.accessToken ?? null;
      if (t) setToken(t);
      // fetch user profile
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }: { name?: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await apiRegister({ name, email, password });
      const t = res?.token ?? res?.accessToken ?? null;
      if (t) setToken(t);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
