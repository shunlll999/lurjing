"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/app/(public)/auth-layout";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, ready } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!acceptTerms) {
      setError("กรุณายอมรับ Terms & Conditions ก่อนสมัคร");
      return;
    }

    setError("");
    setSubmitting(true);

    const result = await register({
      displayName,
      storeName,
      email,
      password,
    });

    if (!result.ok) {
      setError(result.message || "สมัครบัญชีไม่สำเร็จ");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthLayout
      title="เริ่มดู “กำไรจริง” ของร้าน"
      subtitle="สร้างบัญชี POC แล้วนำเข้าข้อมูลร้านได้ทันที"
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-form-row">
          <label>
            <span>ชื่อผู้ใช้งาน</span>
            <input
              required
              placeholder="เช่น Wachara"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <label>
            <span>ชื่อร้าน</span>
            <input
              required
              placeholder="เช่น My Online Shop"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
            />
          </label>
        </div>

        <label>
          <span>อีเมล</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          <span>รหัสผ่าน</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="terms-check">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
          />
          <span>
            ฉันอ่านและยอมรับ <Link href="/terms">Terms & Conditions</Link>
          </span>
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button className="button primary auth-submit" disabled={submitting}>
          {submitting ? "กำลังสร้างบัญชี..." : "สร้างบัญชีฟรี"}
        </button>
      </form>

      <p className="auth-switch">
        มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </AuthLayout>
  );
}
