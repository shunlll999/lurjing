import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-backdrop" />
      <div className="auth-shell">
        <Link href="/" className="auth-brand">
          <BrandMark size={100} />
          <div>
            <strong>เหลือจริง</strong>
            <small>Seller Profit</small>
          </div>
        </Link>

        <section className="auth-card">
          <div className="auth-card-head">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </section>

        <p className="auth-footnote">
          POC สำหรับทดลอง Product Experience • ข้อมูลบัญชีที่สมัครเก็บอยู่ใน browser นี้
        </p>
      </div>
    </div>
  );
}
