import { FirebaseError } from "firebase/app";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { getFirebaseStorage } from "@/lib/firebase";

export const STORE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const STORE_AVATAR_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface StoreAvatarUploadResult {
  url: string;
  path: string;
}

export function validateStoreAvatar(file: File) {
  if (!STORE_AVATAR_ACCEPT.includes(file.type as (typeof STORE_AVATAR_ACCEPT)[number])) {
    return "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP";
  }

  if (file.size > STORE_AVATAR_MAX_BYTES) {
    return "รูปต้องมีขนาดไม่เกิน 5 MB";
  }

  return "";
}

export async function uploadStoreAvatar(
  uid: string,
  file: File,
): Promise<StoreAvatarUploadResult> {
  const validation = validateStoreAvatar(file);
  if (validation) throw new Error(validation);

  // Fixed path means a new upload replaces the previous avatar instead of
  // leaving unused image files in Storage.
  const path = `users/${uid}/profile/store-avatar`;
  const avatarRef = ref(getFirebaseStorage(), path);

  await uploadBytes(avatarRef, file, {
    contentType: file.type,
    cacheControl: "public,max-age=3600",
    customMetadata: {
      ownerUid: uid,
      purpose: "store-avatar",
    },
  });

  const downloadUrl = await getDownloadURL(avatarRef);
  const versionedUrl = `${downloadUrl}${downloadUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

  return {
    path,
    url: versionedUrl,
  };
}

export async function deleteStoreAvatar(path?: string) {
  if (!path) return;

  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "storage/object-not-found") {
      return;
    }
    throw error;
  }
}

export function getStoreAvatarError(error: unknown) {
  if (error instanceof Error && error.message.includes("Firebase Storage config missing")) {
    return "ยังไม่ได้ตั้งค่า Firebase Storage กรุณาใส่ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ใน .env";
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "storage/unauthorized":
        return "Storage Rules ไม่อนุญาตให้อัปโหลดรูปนี้ กรุณา deploy storage.rules";
      case "storage/quota-exceeded":
        return "Firebase Storage quota เต็ม กรุณาตรวจสอบ Usage/Billing";
      case "storage/retry-limit-exceeded":
        return "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      case "storage/unknown":
        return "Firebase Storage ยังไม่พร้อม กรุณาตรวจสอบ Storage bucket";
      default:
        return error.message || "อัปโหลดรูปไม่สำเร็จ";
    }
  }

  return error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ";
}
