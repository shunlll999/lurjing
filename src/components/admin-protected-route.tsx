"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace(
        "/login?next=/admin",
      );
      return;
    }

    if (
      user.status !== "active" ||
      user.role !== "admin"
    ) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-dot" />
        <span>
          กำลังตรวจสอบ Firebase Admin session...
        </span>
      </div>
    );
  }

  if (
    !user ||
    user.status !== "active" ||
    user.role !== "admin"
  ) {
    return null;
  }

  return <>{children}</>;
}
