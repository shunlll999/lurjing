import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  getFirebaseAuth,
  getFirebaseDb,
} from "@/lib/firebase";
import type {
  FeedbackItem,
  FeedbackModerationStatus,
} from "@/types/feedback";
import type { UserProfile } from "@/types/auth";

const COLLECTION = "feedback";

function sortNewest(
  items: FeedbackItem[],
) {
  return [...items].sort(
    (a, b) =>
      b.createdAt.localeCompare(
        a.createdAt,
      ),
  );
}

function requireFirebaseUser(
  expectedUid?: string,
) {
  const firebaseUser =
    getFirebaseAuth().currentUser;

  if (!firebaseUser) {
    throw new FirebaseError(
      "auth/unauthenticated",
      "Firebase Authentication session is not ready.",
    );
  }

  if (
    expectedUid &&
    firebaseUser.uid !== expectedUid
  ) {
    throw new FirebaseError(
      "auth/session-mismatch",
      "Firebase Authentication UID does not match the LurJing profile.",
    );
  }

  return firebaseUser;
}

export function getFeedbackErrorMessage(
  error: unknown,
) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
      case "firestore/permission-denied":
        return "Firestore Rules ไม่อนุญาตให้ Feedback ทำรายการนี้ กรุณา deploy firestore.rules เวอร์ชันล่าสุด";

      case "auth/unauthenticated":
      case "auth/session-mismatch":
        return "Firebase session ยังไม่พร้อม กรุณาออกจากระบบแล้ว Login ใหม่";

      case "unavailable":
      case "firestore/unavailable":
        return "เชื่อมต่อ Firestore ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";

      case "failed-precondition":
      case "firestore/failed-precondition":
        return "Firestore ยังตั้งค่าไม่ครบ กรุณาตรวจสอบ Database และ Rules";

      default:
        return `Firebase error: ${error.code}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

export async function submitFeedback(
  user: UserProfile,
  input: {
    rating: number;
    message: string;
    allowPublic: boolean;
  },
): Promise<FeedbackItem> {
  const firebaseUser =
    requireFirebaseUser(user.id);

  const message =
    input.message.trim();

  if (message.length < 10) {
    throw new Error(
      "ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร",
    );
  }

  if (message.length > 600) {
    throw new Error(
      "ความคิดเห็นต้องไม่เกิน 600 ตัวอักษร",
    );
  }

  const now =
    new Date().toISOString();

  const payload = {
    userId: firebaseUser.uid,

    displayName:
      user.displayName?.trim() ||
      firebaseUser.displayName?.trim() ||
      "LurJing User",

    storeName:
      user.storeName?.trim() ||
      "ร้านของฉัน",

    rating: Math.max(
      1,
      Math.min(
        5,
        Math.round(input.rating),
      ),
    ),

    message,

    allowPublic:
      Boolean(input.allowPublic),

    moderationStatus:
      "pending" as const,

    featured: false,

    createdAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(
    collection(
      getFirebaseDb(),
      COLLECTION,
    ),
    payload,
  );

  return {
    id: ref.id,
    ...payload,
  };
}

export async function listMyFeedback(
  expectedUserId: string,
) {
  const firebaseUser =
    requireFirebaseUser(
      expectedUserId,
    );

  const snapshot = await getDocs(
    query(
      collection(
        getFirebaseDb(),
        COLLECTION,
      ),
      where(
        "userId",
        "==",
        firebaseUser.uid,
      ),
      limit(50),
    ),
  );

  return sortNewest(
    snapshot.docs.map(
      (item) =>
        ({
          id: item.id,
          ...item.data(),
        }) as FeedbackItem,
    ),
  );
}

export async function listAdminFeedback(
  maximum = 200,
) {
  requireFirebaseUser();

  const snapshot = await getDocs(
    query(
      collection(
        getFirebaseDb(),
        COLLECTION,
      ),
      orderBy(
        "createdAt",
        "desc",
      ),
      limit(maximum),
    ),
  );

  return snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as FeedbackItem,
  );
}

export async function moderateFeedback(
  id: string,
  moderationStatus: FeedbackModerationStatus,
  currentFeatured = false,
) {
  requireFirebaseUser();

  await updateDoc(
    doc(
      getFirebaseDb(),
      COLLECTION,
      id,
    ),
    {
      moderationStatus,
      featured:
        moderationStatus === "approved"
          ? currentFeatured
          : false,
      updatedAt:
        new Date().toISOString(),
    },
  );
}

export async function setFeedbackFeatured(
  item: FeedbackItem,
  featured: boolean,
) {
  requireFirebaseUser();

  if (
    featured &&
    !item.allowPublic
  ) {
    throw new Error(
      "User did not allow this feedback to be used as a testimonial",
    );
  }

  await updateDoc(
    doc(
      getFirebaseDb(),
      COLLECTION,
      item.id,
    ),
    {
      moderationStatus:
        "approved",
      featured,
      updatedAt:
        new Date().toISOString(),
    },
  );
}

export async function removeFeedback(
  id: string,
) {
  requireFirebaseUser();

  await deleteDoc(
    doc(
      getFirebaseDb(),
      COLLECTION,
      id,
    ),
  );
}
