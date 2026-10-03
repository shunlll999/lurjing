import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore/lite";

import { getFirebaseDb } from "@/lib/firebase";
import type {
  UserProfile,
  UserStatus,
} from "@/types/auth";

const USERS_COLLECTION = "users";

function normalizeProfile(
  id: string,
  data: Partial<UserProfile>,
): UserProfile {
  const now = new Date().toISOString();

  return {
    id: data.id ?? id,
    email: data.email ?? "",
    displayName:
      data.displayName ??
      data.email?.split("@")[0] ??
      "User",
    storeName:
      data.storeName ?? "ร้านของฉัน",
    phone: data.phone ?? "",
    plan: data.plan ?? "Free",
    role: data.role ?? "user",
    status: data.status ?? "active",
    emailVerified:
      data.emailVerified ?? false,
    providerId:
      data.providerId ?? "password",
    createdAt:
      data.createdAt ?? now,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
    termsAcceptedAt:
      data.termsAcceptedAt,
    isDemo: data.isDemo ?? false,
  };
}

export async function listAdminUsers() {
  const snapshot = await getDocs(
    collection(
      getFirebaseDb(),
      USERS_COLLECTION,
    ),
  );

  return snapshot.docs
    .map((item) =>
      normalizeProfile(
        item.id,
        item.data() as Partial<UserProfile>,
      ),
    )
    .sort((a, b) =>
      b.createdAt.localeCompare(
        a.createdAt,
      ),
    );
}

export async function setAdminUserStatus(
  uid: string,
  status: UserStatus,
) {
  await updateDoc(
    doc(
      getFirebaseDb(),
      USERS_COLLECTION,
      uid,
    ),
    {
      status,
      updatedAt:
        new Date().toISOString(),
    },
  );
}
