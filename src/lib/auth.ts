import type { StoredAccount } from "@/types/auth";

export const DEMO_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@lurjing.com";

export const DEMO_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo123";

export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL ??
  "admin@lurjing.com";

export const authKeys = {
  accounts: "lurjing:accounts",
} as const;

function normalizeAccount(
  account: StoredAccount,
): StoredAccount {
  return {
    ...account,
    role: account.role ?? "user",
    status: account.status ?? "active",
    plan: account.plan ?? "Free",
  };
}

/**
 * POC Admin mirror only.
 * Firebase Authentication + Firestore are the actual source of truth.
 */
export function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(
      window.localStorage.getItem(
        authKeys.accounts,
      ) ?? "[]",
    ) as StoredAccount[];

    return raw.map(normalizeAccount);
  } catch {
    return [];
  }
}

export function writeAccounts(
  accounts: StoredAccount[],
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    authKeys.accounts,
    JSON.stringify(accounts),
  );
}

export function upsertAccount(
  account: StoredAccount,
) {
  const accounts = readAccounts();
  const exists = accounts.some(
    (item) => item.id === account.id,
  );

  writeAccounts(
    exists
      ? accounts.map((item) =>
          item.id === account.id
            ? { ...item, ...account }
            : item,
        )
      : [...accounts, account],
  );
}
