"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const [
    displayName,
    setDisplayName,
  ] = useState(
    user?.displayName ?? "",
  );

  const [
    storeName,
    setStoreName,
  ] = useState(
    user?.storeName ?? "",
  );

  const [phone, setPhone] =
    useState(user?.phone ?? "");

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setDisplayName(
      user?.displayName ?? "",
    );
    setStoreName(
      user?.storeName ?? "",
    );
    setPhone(
      user?.phone ?? "",
    );
  }, [user]);

  const save = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setSaved(false);
    setError("");

    const result =
      await updateProfile({
        displayName,
        storeName,
        phone,
      });

    setSaving(false);

    if (!result.ok) {
      setError(
        result.message ??
          "บันทึก Profile ไม่สำเร็จ",
      );
      return;
    }

    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1800,
    );
  };

  return (
    <div className="profile-page">
      <section className="card profile-hero">
        <div className="profile-avatar-large">
          {(user?.displayName || "U")
            .slice(0, 1)
            .toUpperCase()}
        </div>

        <div>
          <p className="eyebrow">
            ACCOUNT PROFILE
          </p>
          <h2>
            {user?.displayName}
          </h2>
          <p className="muted">
            {user?.email}
          </p>
        </div>

        <span className="profile-plan">
          {user?.plan} Plan
        </span>
      </section>

      <section className="profile-grid section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                PROFILE
              </p>
              <h2>
                ข้อมูลบัญชี
              </h2>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={save}
          >
            <label>
              <span>
                ชื่อผู้ใช้งาน
              </span>
              <input
                value={displayName}
                required
                disabled={
                  user?.isDemo ||
                  saving
                }
                onChange={(event) =>
                  setDisplayName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>ชื่อร้าน</span>
              <input
                value={storeName}
                required
                disabled={
                  user?.isDemo ||
                  saving
                }
                onChange={(event) =>
                  setStoreName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>อีเมล</span>
              <input
                value={
                  user?.email ?? ""
                }
                disabled
              />
            </label>

            <label>
              <span>
                เบอร์โทร (ไม่บังคับ)
              </span>
              <input
                value={phone}
                disabled={
                  user?.isDemo ||
                  saving
                }
                onChange={(event) =>
                  setPhone(
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

            {!user?.isDemo && (
              <button
                className="button primary profile-save"
                disabled={saving}
              >
                {saving
                  ? "กำลังบันทึก..."
                  : saved
                    ? "บันทึกแล้ว ✓"
                    : "บันทึกข้อมูล"}
              </button>
            )}
          </form>

          {user?.isDemo && (
            <div className="profile-demo-note">
              Demo Account
              เป็นบัญชีอ่าน/ทดลอง
              ระบบจึงล็อกการแก้ Profile ไว้
            </div>
          )}
        </article>

        <aside className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                ACCOUNT
              </p>
              <h2>
                สถานะบัญชี
              </h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div>
              <span>Plan</span>
              <strong>
                {user?.plan}
              </strong>
            </div>

            <div>
              <span>
                Account type
              </span>
              <strong>
                {user?.isDemo
                  ? "Demo"
                  : "Registered"}
              </strong>
            </div>

            <div>
              <span>
                สร้างเมื่อ
              </span>
              <strong>
                {user?.createdAt
                  ? new Intl.DateTimeFormat(
                      "th-TH",
                      {
                        dateStyle:
                          "medium",
                      },
                    ).format(
                      new Date(
                        user.createdAt,
                      ),
                    )
                  : "-"}
              </strong>
            </div>

            <div>
              <span>
                Profile storage
              </span>
              <strong>
                Firebase Firestore
              </strong>
            </div>
          </div>

          <div className="profile-security-note">
            <strong>
              Firebase Profile
            </strong>
            <p>
              ข้อมูล Profile ของบัญชีจริง
              ถูกอ่านและบันทึกที่
              Firestore document
              users/{"{uid}"} ของผู้ใช้งาน
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
