"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-logo";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/settings", label: "Early Settings" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <BrandMark size={38} />
          <div>
            <strong>เหลือจริง Admin</strong>
            <small>Early Control Center</small>
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
          <button className="button ghost full" onClick={() => void signOut()}>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Early ADMIN</p>
            <h1>Control Center</h1>
          </div>
          <span className="admin-environment">LOCAL Early</span>
        </header>
        {children}
      </main>
    </div>
  );
}
