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
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="auth-loading">
        <div className="auth-loading-dot" />
        <span>กำลังตรวจสอบสิทธิ์ Admin...</span>
      </div>
    );
  }

  return <>{children}</>;
}
