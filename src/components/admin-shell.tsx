"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-logo";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/settings", label: "POC Settings" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const signOut = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <BrandMark size={38} />
          <div>
            <strong>เหลือจริง Admin</strong>
            <small>POC Control Center</small>
          </div>
        </Link>

        <nav>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "admin-nav active" : "admin-nav"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-account">
            <span>{(user?.displayName || "A").slice(0, 1)}</span>
            <div>
              <strong>{user?.displayName}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <Link className="button secondary full" href="/dashboard">
            เปิด User App
          </Link>
          <button className="button ghost full" onClick={signOut}>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">POC ADMIN</p>
            <h1>Control Center</h1>
          </div>
          <span className="admin-environment">LOCAL POC</span>
        </header>
        {children}
      </main>
    </div>
  );
}
