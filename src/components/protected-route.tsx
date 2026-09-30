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
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (
      !user ||
      user.status !== "active"
    ) {
      const next =
        pathname || "/dashboard";

      router.replace(
        `/login?next=${encodeURIComponent(
          next,
        )}`,
      );
    }
  }, [
    ready,
    user,
    pathname,
    router,
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
