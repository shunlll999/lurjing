import type { User as FirebaseUser } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ADMIN_EMAIL,
  DEMO_EMAIL,
} from "@/lib/auth";
import { getFirebaseDb } from "@/lib/firebase";
import type { UserProfile } from "@/types/auth";

const USERS_COLLECTION = "users";

function normalizeEmail(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isAdminEmail(email?: string | null) {
  return (
    normalizeEmail(email) ===
    normalizeEmail(ADMIN_EMAIL)
  );
}

function isDemoEmail(email?: string | null) {
  return (
    normalizeEmail(email) ===
    normalizeEmail(DEMO_EMAIL)
  );
}

function userDoc(uid: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
  );
}

function providerId(firebaseUser: FirebaseUser) {
  return (
    firebaseUser.providerData[0]?.providerId ??
    "password"
  );
}

export function buildFallbackProfile(
  firebaseUser: FirebaseUser,
): UserProfile {
  const email = firebaseUser.email ?? "";
  const admin = isAdminEmail(email);
  const demo = isDemoEmail(email);
  const now = new Date().toISOString();

  return {
    id: firebaseUser.uid,
    email,

    displayName:
      firebaseUser.displayName ||
      email.split("@")[0] ||
      "User",

    storeName: admin
      ? "LurJing"
      : demo
        ? "Demo Store"
        : "ร้านของฉัน",

    phone: firebaseUser.phoneNumber ?? "",

    plan: admin
      ? "Admin"
      : demo
        ? "Demo"
        : "Free",

    role: admin ? "admin" : "user",
    status: "active",

    emailVerified:
      firebaseUser.emailVerified,

    providerId:
      providerId(firebaseUser),

    createdAt:
      firebaseUser.metadata.creationTime ??
      now,

    updatedAt: now,

    lastLoginAt:
      firebaseUser.metadata.lastSignInTime ??
      now,

    isDemo: demo,
  };
}

export async function createUserProfile(
  firebaseUser: FirebaseUser,
  input: {
    displayName: string;
    storeName: string;
    phone?: string;
    termsAcceptedAt?: string;
  },
) {
  const now = new Date().toISOString();
  const email = firebaseUser.email ?? "";

  const profile: UserProfile = {
    id: firebaseUser.uid,
    email,

    displayName:
      input.displayName.trim(),

    storeName:
      input.storeName.trim(),

    phone:
      input.phone?.trim() ?? "",

    plan: "Free",
    role: "user",
    status: "active",

    emailVerified:
      firebaseUser.emailVerified,

    providerId:
      providerId(firebaseUser),

    createdAt:
      firebaseUser.metadata.creationTime ??
      now,

    updatedAt: now,
    lastLoginAt: now,

    termsAcceptedAt:
      input.termsAcceptedAt ?? now,

    isDemo: false,
  };

  console.info(
    "[Firestore] create users/%s",
    firebaseUser.uid,
  );

  await setDoc(
    userDoc(firebaseUser.uid),
    profile,
  );

  console.info(
    "[Firestore] created users/%s",
    firebaseUser.uid,
  );

  return profile;
}

export async function getUserProfile(
  firebaseUser: FirebaseUser,
): Promise<UserProfile> {
  const fallback =
    buildFallbackProfile(firebaseUser);

  const snapshot = await getDoc(
    userDoc(firebaseUser.uid),
  );

  if (!snapshot.exists()) {
    return fallback;
  }

  const stored =
    snapshot.data() as UserProfile;

  const admin =
    isAdminEmail(firebaseUser.email);

  const demo =
    isDemoEmail(firebaseUser.email);

  return {
    ...fallback,
    ...stored,

    id: firebaseUser.uid,
    email:
      firebaseUser.email ??
      stored.email,

    // POC role mapping is always derived from the configured admin email.
    role: admin ? "admin" : "user",

    plan: admin
      ? "Admin"
      : demo
        ? "Demo"
        : stored.plan ?? "Free",

    status:
      stored.status ?? "active",

    emailVerified:
      firebaseUser.emailVerified,

    providerId:
      providerId(firebaseUser),

    isDemo: demo,
  };
}

/**
 * Existing Firebase Auth accounts created before Firestore integration
 * get a Firestore document the next time they log in.
 */
export async function ensureUserProfile(
  firebaseUser: FirebaseUser,
) {
  const ref = userDoc(firebaseUser.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return getUserProfile(firebaseUser);
  }

  const fallback =
    buildFallbackProfile(firebaseUser);

  // Admin UI role remains email-derived and does not need a client-created
  // Firestore document for this static POC.
  if (fallback.role === "admin") {
    return fallback;
  }

  await setDoc(ref, fallback);

  return fallback;
}

export async function touchUserLogin(
  firebaseUser: FirebaseUser,
) {
  const profile =
    await ensureUserProfile(firebaseUser);

  if (profile.role === "admin") {
    return;
  }

  const now = new Date().toISOString();

  await updateDoc(
    userDoc(firebaseUser.uid),
    {
      lastLoginAt: now,
      updatedAt: now,
      emailVerified:
        firebaseUser.emailVerified,
      providerId:
        providerId(firebaseUser),
    },
  );
}

export async function updateOwnUserProfile(
  uid: string,
  updates: {
    displayName?: string;
    storeName?: string;
    phone?: string;
  },
) {
  const payload = {
    ...(updates.displayName !== undefined
      ? {
          displayName:
            updates.displayName.trim(),
        }
      : {}),

    ...(updates.storeName !== undefined
      ? {
          storeName:
            updates.storeName.trim(),
        }
      : {}),

    ...(updates.phone !== undefined
      ? {
          phone:
            updates.phone.trim(),
        }
      : {}),

    updatedAt:
      new Date().toISOString(),
  };

  await updateDoc(
    userDoc(uid),
    payload,
  );

  return payload;
}
