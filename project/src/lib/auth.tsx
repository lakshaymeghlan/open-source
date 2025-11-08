// src/lib/auth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister } from "./api";

type User = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
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

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      // backend expected { token, user }
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }: { name?: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await apiRegister({ name, email, password });
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
