"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { AuthLayout } from "@/app/(public)/auth-layout";
import { useAuth } from "@/components/auth-provider";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/auth";

const SAFE_NEXT_ROUTES = [
  "/dashboard",
  "/costs",
  "/products",
  "/simulator",
  "/ai-owner",
  "/import",
  "/profile",
  "/feedback",
  "/admin",
  "/admin/users",
  "/admin/feedback",
  "/admin/settings",
] as const;

type SafeNextRoute =
  (typeof SAFE_NEXT_ROUTES)[number];

function getSafeNextRoute(
  value: string | null,
): SafeNextRoute {
  switch (value) {
    case "/dashboard":
    case "/costs":
    case "/products":
    case "/simulator":
    case "/ai-owner":
    case "/import":
    case "/profile":
    case "/feedback":
    case "/admin":
    case "/admin/users":
    case "/admin/feedback":
    case "/admin/settings":
      return value;

    default:
      return "/dashboard";
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const {
    login,
    loginDemo,
    user,
    ready,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const next =
    getSafeNextRoute(
      searchParams.get("next"),
    );

  const pushSafeRoute = (
    route: SafeNextRoute,
  ) => {
    switch (route) {
      case "/dashboard":
        router.push("/dashboard");
        break;
      case "/costs":
        router.push("/costs");
        break;
      case "/products":
        router.push("/products");
        break;
      case "/simulator":
        router.push("/simulator");
        break;
      case "/ai-owner":
        router.push("/ai-owner");
        break;
      case "/import":
        router.push("/import");
        break;
      case "/profile":
        router.push("/profile");
        break;
      case "/feedback":
        router.push("/feedback");
        break;
      case "/admin":
        router.push("/admin");
        break;
      case "/admin/users":
        router.push("/admin/users");
        break;
      case "/admin/feedback":
        router.push(
          "/admin/feedback",
        );
        break;
      case "/admin/settings":
        router.push(
          "/admin/settings",
        );
        break;
      default:
        router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!ready || !user) return;

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    pushSafeRoute(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, router]);

  useEffect(() => {
    if (
      searchParams.get("demo") ===
      "1"
    ) {
      setEmail(DEMO_EMAIL);
      setPassword(DEMO_PASSWORD);
    }
  }, [searchParams]);

  const onSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    const result = await login(
      email,
      password,
    );

    if (!result.ok) {
      setError(
        result.message ??
          "เข้าสู่ระบบไม่สำเร็จ",
      );
      setSubmitting(false);
      return;
    }

    if (
      result.destination ===
      "/admin"
    ) {
      router.push("/admin");
      return;
    }

    pushSafeRoute(next);
  };

  const openDemo = async () => {
    setError("");
    setSubmitting(true);

    const result =
      await loginDemo();

    if (!result.ok) {
      setError(
        result.message ??
          "Demo account ยังไม่ได้สร้างใน Firebase Authentication",
      );
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthLayout
      title="กลับมาดูว่าเหลือจริงเท่าไร"
      subtitle="เข้าสู่ระบบด้วย Firebase Authentication"
    >
      <form
        className="auth-form"
        onSubmit={onSubmit}
      >
        <label>
          <span>อีเมล</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          <span>รหัสผ่าน</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
          />
        </label>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="button primary auth-submit"
          disabled={submitting}
        >
          {submitting
            ? "กำลังเข้าสู่ระบบ..."
            : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="auth-divider">
        <span>หรือ</span>
      </div>

      <button
        type="button"
        className="demo-login-card"
        onClick={openDemo}
        disabled={submitting}
      >
        <div>
          <strong>
            เข้า Demo Account
          </strong>
          <span>
            Demo เท่านั้นที่ใช้ข้อมูลตัวอย่างของระบบ
          </span>
        </div>
        <b>→</b>
      </button>
      <p className="auth-switch">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register">
          สมัครฟรี
        </Link>
      </p>
    </AuthLayout>
  );
}

function LoginLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-dot" />
      <span>
        กำลังโหลด Firebase Auth...
      </span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoginLoading />}
    >
      <LoginContent />
    </Suspense>
  );
}
