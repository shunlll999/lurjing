"use client";

import { useEffect } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    ready,
    refreshSessionProfile,
  } = useAuth();

  useEffect(() => {
    if (!ready) return;

    const next =
      pathname || "/dashboard";

    if (
      !user ||
      user.status !== "active"
    ) {
      router.replace(
        `/login?next=${encodeURIComponent(
          next,
        )}`,
      );
      return;
    }

    let cancelled = false;

    // Performance Mode: one-time status validation on navigation.
    // No Firestore realtime listener is kept open.
    void refreshSessionProfile().then(
      (active) => {
        if (
          !active &&
          !cancelled
        ) {
          router.replace(
            `/login?next=${encodeURIComponent(
              next,
            )}`,
          );
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    user?.id,
    user?.status,
    pathname,
    router,
    refreshSessionProfile,
  ]);

  if (!ready) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-dot" />
        <span>
          กำลังตรวจสอบ Firebase session...
        </span>
      </div>
    );
  }

  if (
    !user ||
    user.status !== "active"
  ) {
    return null;
  }

  return <>{children}</>;
}
