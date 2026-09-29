"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-dot" />
        <span>กำลังโหลดบัญชี...</span>
      </div>
    );
  }

  return <>{children}</>;
}
