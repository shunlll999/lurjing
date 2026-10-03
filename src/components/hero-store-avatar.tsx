"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function HeroStoreAvatar() {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const avatarUrl = user?.storeAvatarUrl?.trim();
  const initial =
    user?.storeName?.trim().charAt(0).toLocaleUpperCase("th-TH") || "ร";

  if (avatarUrl && !imageFailed) {
    return (
      <span className="hero-store-avatar hero-store-avatar-image">
        <img
          src={avatarUrl}
          alt={user?.storeName ? `รูปโปรไฟล์ร้าน ${user.storeName}` : "รูปโปรไฟล์ร้าน"}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="hero-store-avatar" aria-hidden="true">
      {initial}
    </span>
  );
}
