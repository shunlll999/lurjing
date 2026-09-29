import type { StoredAccount, UserProfile } from "@/types/auth";

export const DEMO_EMAIL = "demo@lurjing.com";
export const DEMO_PASSWORD = "demo1234";
export const ADMIN_EMAIL = "admin@lurjing.com";
export const ADMIN_PASSWORD = "admin1234";

export const authKeys = {
  accounts: "lurjing:accounts",
  session: "lurjing:session",
} as const;

export const demoProfile: UserProfile = {
  id: "demo-account",
  email: DEMO_EMAIL,
  displayName: "เจ้าของร้าน Demo",
  storeName: "Glow & Co.",
  phone: "08x-xxx-xxxx",
  plan: "Demo",
  role: "user",
  status: "active",
  createdAt: "2026-09-29T00:00:00.000Z",
  isDemo: true,
};

export const adminProfile: UserProfile = {
  id: "admin-account",
  email: ADMIN_EMAIL,
  displayName: "POC Admin",
  storeName: "เหลือจริง",
  phone: "",
  plan: "Admin",
  role: "admin",
  status: "active",
  createdAt: "2026-09-29T00:00:00.000Z",
};

export async function hashPassword(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeAccount(account: StoredAccount): StoredAccount {
  return {
    ...account,
    role: account.role ?? "user",
    status: account.status ?? "active",
    plan: account.plan ?? "Free",
  };
}

export function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(authKeys.accounts) ?? "[]",
    ) as StoredAccount[];
    return raw.map(normalizeAccount);
  } catch {
    return [];
  }
}

export function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(authKeys.accounts, JSON.stringify(accounts));
}

export function readSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const profile = JSON.parse(
      window.localStorage.getItem(authKeys.session) ?? "null",
    ) as UserProfile | null;
    if (!profile) return null;
    return {
      ...profile,
      role: profile.role ?? "user",
      status: profile.status ?? "active",
    };
  } catch {
    return null;
  }
}

export function writeSession(user: UserProfile | null) {
  if (!user) {
    window.localStorage.removeItem(authKeys.session);
    return;
  }
  window.localStorage.setItem(authKeys.session, JSON.stringify(user));
}
