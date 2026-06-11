"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface Customer {
  id: string; firstName: string; lastName: string;
  email: string; phone: string | null;
  defaultAddress: any | null;
  orders: { nodes: any[] };
}

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  recover: (email: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account?action=me", { cache: "no-store" });
      const data = await res.json();
      setCustomer(data.customer ?? null);
    } catch { setCustomer(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch("/api/account", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Login failed";
    await refresh();
    return null;
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<string | null> => {
    const res = await fetch("/api/account", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", firstName, lastName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Registration failed";
    await refresh();
    return null;
  };

  const logout = async () => {
    await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setCustomer(null);
  };

  const recover = async (email: string): Promise<boolean> => {
    const res = await fetch("/api/account", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "recover", email }),
    });
    const data = await res.json();
    return data.sent === true;
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout, recover, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
