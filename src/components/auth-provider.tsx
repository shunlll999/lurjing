"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  adminProfile,
  demoProfile,
  hashPassword,
  readAccounts,
  readSession,
  writeAccounts,
  writeSession,
} from "@/lib/auth";
import type { StoredAccount, UserProfile } from "@/types/auth";

interface RegisterInput {
  displayName: string;
  storeName: string;
  email: string;
  password: string;
}

type LoginDestination = "/dashboard" | "/admin";

interface LoginResult {
  ok: boolean;
  message?: string;
  destination?: LoginDestination;
}

interface AuthContextValue {
  user: UserProfile | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<LoginResult>;
  loginDemo: () => Promise<void>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (
    updates: Partial<Pick<UserProfile, "displayName" | "storeName" | "phone">>,
  ) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  const login: AuthContextValue["login"] = async (
    email: string,
    password: string,
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser(adminProfile);
      writeSession(adminProfile);
      return { ok: true, destination: "/admin" };
    }

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(demoProfile);
      writeSession(demoProfile);
      return { ok: true, destination: "/dashboard" };
    }

    const passwordHash = await hashPassword(password);
    const account = readAccounts().find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.passwordHash === passwordHash,
    );

    if (!account) {
      return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    if (account.status === "disabled") {
      return {
        ok: false,
        message: "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      };
    }

    const { passwordHash: _, ...profile } = account;
    setUser(profile);
    writeSession(profile);

    const destination: LoginDestination =
      profile.role === "admin" ? "/admin" : "/dashboard";

    return {
      ok: true,
      destination,
    };
  };

  const loginDemo = async () => {
    setUser(demoProfile);
    writeSession(demoProfile);
  };

  const register = async (input: RegisterInput) => {
    const email = input.email.trim().toLowerCase();
    const accounts = readAccounts();

    if (
      email === DEMO_EMAIL ||
      email === ADMIN_EMAIL ||
      accounts.some((item) => item.email.toLowerCase() === email)
    ) {
      return { ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      email,
      displayName: input.displayName.trim(),
      storeName: input.storeName.trim(),
      phone: "",
      plan: "Free",
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(input.password),
    };

    writeAccounts([...accounts, account]);

    const { passwordHash: _, ...profile } = account;
    setUser(profile);
    writeSession(profile);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    writeSession(null);
  };

  const updateProfile = (
    updates: Partial<Pick<UserProfile, "displayName" | "storeName" | "phone">>,
  ) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    setUser(nextUser);
    writeSession(nextUser);

    if (!user.isDemo && user.role !== "admin") {
      const accounts = readAccounts();
      writeAccounts(
        accounts.map((account) =>
          account.id === user.id ? { ...account, ...updates } : account,
        ),
      );
    }
  };

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      ready,
      login,
      loginDemo,
      register,
      logout,
      updateProfile,
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
