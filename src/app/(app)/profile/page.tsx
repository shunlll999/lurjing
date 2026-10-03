"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { StoreAvatar } from "@/components/store-avatar";
import {
  deleteStoreAvatar,
  getStoreAvatarError,
  uploadStoreAvatar,
  validateStoreAvatar,
} from "@/lib/store-avatar";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [storeName, setStoreName] = useState(user?.storeName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setStoreName(user?.storeName ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }

    const preview = URL.createObjectURL(avatarFile);
    setAvatarPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [avatarFile]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const result = await updateProfile({ displayName, storeName, phone });
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "บันทึก Profile ไม่สำเร็จ");
      return;
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarMessage("");

    if (!file) {
      setAvatarFile(null);
      return;
    }

    const validation = validateStoreAvatar(file);
    if (validation) {
      setAvatarFile(null);
      setAvatarMessage(validation);
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
  };

  const saveAvatar = async () => {
    if (!user || !avatarFile || user.isDemo) return;

    setUploadingAvatar(true);
    setAvatarMessage("");

    try {
      const uploaded = await uploadStoreAvatar(user.id, avatarFile);
      const result = await updateProfile({
        storeAvatarUrl: uploaded.url,
        storeAvatarPath: uploaded.path,
      });

      if (!result.ok) {
        throw new Error(result.message ?? "บันทึก URL รูปร้านไม่สำเร็จ");
      }

      setAvatarFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setAvatarMessage("อัปโหลดรูปโปรไฟล์ร้านแล้ว ✓");
    } catch (uploadError) {
      setAvatarMessage(getStoreAvatarError(uploadError));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || user.isDemo || !user.storeAvatarUrl) return;

    setUploadingAvatar(true);
    setAvatarMessage("");

    try {
      await deleteStoreAvatar(user.storeAvatarPath);
      const result = await updateProfile({
        storeAvatarUrl: "",
        storeAvatarPath: "",
      });

      if (!result.ok) {
        throw new Error(result.message ?? "ลบรูปโปรไฟล์ร้านไม่สำเร็จ");
      }

      setAvatarFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setAvatarMessage("ลบรูปโปรไฟล์ร้านแล้ว");
    } catch (removeError) {
      setAvatarMessage(getStoreAvatarError(removeError));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const shownAvatar = avatarPreview || user?.storeAvatarUrl;

  return (
    <div className="profile-page">
      <section className="card profile-hero">
        <StoreAvatar
          className="profile-avatar-large"
          src={shownAvatar}
          name={user?.storeName || user?.displayName || "ร้าน"}
          eager
        />

        <div>
          <p className="eyebrow">SHOP PROFILE</p>
          <h2>{user?.storeName}</h2>
          <p className="muted">{user?.displayName} · {user?.email}</p>
        </div>

        <span className="profile-plan">{user?.plan} Plan</span>
      </section>

      <section className="profile-grid section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">PROFILE</p>
              <h2>ข้อมูลร้านและบัญชี</h2>
            </div>
          </div>

          <div className="profile-avatar-editor">
            <StoreAvatar
              className="profile-avatar-preview"
              src={shownAvatar}
              name={storeName || displayName || "ร้าน"}
              eager
            />

            <div className="profile-avatar-copy">
              <strong>รูปโปรไฟล์ร้าน</strong>
              <p>ใช้ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB รูปจะแสดงใน Sidebar และ Profile</p>

              <input
                ref={inputRef}
                className="file-input-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={Boolean(user?.isDemo) || uploadingAvatar}
                onChange={chooseAvatar}
              />

              {!user?.isDemo && (
                <div className="profile-avatar-actions">
                  <button
                    type="button"
                    className="button secondary"
                    disabled={uploadingAvatar}
                    onClick={() => inputRef.current?.click()}
                  >
                    เลือกรูป
                  </button>

                  {avatarFile && (
                    <button
                      type="button"
                      className="button primary"
                      disabled={uploadingAvatar}
                      onClick={() => void saveAvatar()}
                    >
                      {uploadingAvatar ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                    </button>
                  )}

                  {user?.storeAvatarUrl && !avatarFile && (
                    <button
                      type="button"
                      className="button ghost"
                      disabled={uploadingAvatar}
                      onClick={() => void removeAvatar()}
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              )}

              {avatarMessage && (
                <span className="profile-avatar-message">{avatarMessage}</span>
              )}
            </div>
          </div>

          <form className="profile-form" onSubmit={save}>
            <label>
              <span>ชื่อผู้ใช้งาน</span>
              <input
                value={displayName}
                required
                disabled={Boolean(user?.isDemo) || saving}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>

            <label>
              <span>ชื่อร้าน</span>
              <input
                value={storeName}
                required
                disabled={Boolean(user?.isDemo) || saving}
                onChange={(event) => setStoreName(event.target.value)}
              />
            </label>

            <label>
              <span>อีเมล</span>
              <input value={user?.email ?? ""} disabled />
            </label>

            <label>
              <span>เบอร์โทร (ไม่บังคับ)</span>
              <input
                value={phone}
                disabled={Boolean(user?.isDemo) || saving}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            {!user?.isDemo && (
              <button className="button primary profile-save" disabled={saving}>
                {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึกข้อมูล"}
              </button>
            )}
          </form>

          {user?.isDemo && (
            <div className="profile-demo-note">
              Demo Account เป็นบัญชีอ่าน/ทดลอง ระบบจึงล็อกการแก้ Profile และการอัปโหลดรูปไว้
            </div>
          )}
        </article>

        <aside className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">ACCOUNT</p>
              <h2>สถานะบัญชี</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div><span>Plan</span><strong>{user?.plan}</strong></div>
            <div><span>Account type</span><strong>{user?.isDemo ? "Demo" : "Registered"}</strong></div>
            <div>
              <span>สร้างเมื่อ</span>
              <strong>
                {user?.createdAt
                  ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(user.createdAt))
                  : "-"}
              </strong>
            </div>
            <div><span>Profile storage</span><strong>Firestore + Storage</strong></div>
          </div>

          <div className="profile-security-note">
            <strong>รูปโปรไฟล์ร้าน</strong>
            <p>
              ไฟล์รูปอยู่ใน Firebase Storage ที่ users/{"{uid}"}/profile และ URL ถูกบันทึกใน Firestore users/{"{uid}"}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
