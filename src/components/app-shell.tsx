"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSellerData } from "@/components/seller-data-provider";
import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-logo";
import { StoreAvatar } from "@/components/store-avatar";

const items = [
  { href: "/dashboard", label: "ภาพรวม" },
  { href: "/costs", label: "ต้นทุน Platform" },
  { href: "/products", label: "สินค้า" },
  { href: "/simulator", label: "จำลองโปร" },
  { href: "/ai-owner", label: "AI Owner" },
  { href: "/import", label: "นำเข้าข้อมูล" },
  { href: "/feedback", label: "Feedback" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useSellerData();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <BrandMark size={42} />
          <div>
            <strong>เหลือจริง</strong>
            <span>Seller Profit</span>
          </div>
        </Link>

        <nav>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/profile" className="account-card">
            <StoreAvatar
              className="account-avatar"
              src={user?.storeAvatarUrl}
              name={user?.storeName || user?.displayName || "ร้าน"}
            />
            <span className="account-copy">
              <strong>{user?.displayName}</strong>
              <small>{user?.storeName}</small>
            </span>
            <span className="account-plan">{user?.plan}</span>
          </Link>

          <button className="button secondary full" onClick={reset}>
            {user?.isDemo ? "รีเซ็ต Demo Data" : "ล้างข้อมูล Import"}
          </button>
          <button className="button ghost full" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Seller Profit</p>
            <h1>ขายเยอะแล้ว เหลือกำไรจริงเท่าไร?</h1>
          </div>

          <div className="topbar-actions">
            <Link href="/profile" className="profile-pill">
              <StoreAvatar
                className="profile-pill-avatar"
                src={user?.storeAvatarUrl}
                name={user?.storeName || user?.displayName || "ร้าน"}
              />
              <div>
                <strong>{user?.displayName}</strong>
                <small>{user?.storeName}</small>
              </div>
            </Link>
            <Link href="/import" className="button primary">
              + นำเข้า CSV
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
