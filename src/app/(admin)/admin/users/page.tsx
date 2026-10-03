"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ADMIN_EMAIL, DEMO_EMAIL } from "@/lib/auth";
import { listAdminUsers, setAdminUserStatus } from "@/lib/admin-users";
import type { UserProfile } from "@/types/auth";

function normalizeEmail(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isSystemAccount(account: UserProfile) {
  const email = normalizeEmail(account.email);

  return (
    email === normalizeEmail(ADMIN_EMAIL) ||
    email === normalizeEmail(DEMO_EMAIL) ||
    account.role === "admin" ||
    account.isDemo === true
  );
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(date);
}

export default function AdminUsersPage() {
  const [accounts, setAccounts] = useState<UserProfile[]>([]);

  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const items = await listAdminUsers();

      setAccounts(items);
    } catch (loadError) {
      console.warn("[Admin Users] Firestore load failed", loadError);

      setError(
        "โหลด User จาก Firestore ไม่สำเร็จ กรุณาตรวจสอบ Admin account และ deploy firestore.rules เวอร์ชันล่าสุด",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return accounts;

    return accounts.filter((account) =>
      [
        account.displayName,
        account.storeName,
        account.email,
        account.plan,
        account.status,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [accounts, query]);

  const regularCount = accounts.filter((item) => !isSystemAccount(item)).length;

  const activeCount = accounts.filter(
    (item) => item.status === "active" && !isSystemAccount(item),
  ).length;

  const toggleStatus = async (account: UserProfile) => {
    if (isSystemAccount(account)) {
      return;
    }

    const nextStatus = account.status === "active" ? "disabled" : "active";

    const actionLabel =
      nextStatus === "disabled" ? "ปิดการใช้งาน" : "เปิดการใช้งาน";

    const confirmed = window.confirm(
      `${actionLabel} ${account.email} หรือไม่?`,
    );

    if (!confirmed) return;

    setUpdatingId(account.id);
    setError("");

    try {
      await setAdminUserStatus(account.id, nextStatus);

      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id
            ? {
                ...item,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (updateError) {
      console.warn("[Admin Users] status update failed", updateError);

      setError(
        "เปลี่ยนสถานะ User ไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules แล้วลองอีกครั้ง",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-stat-grid admin-users-stats">
        <article className="admin-stat">
          <span>Firestore profiles</span>
          <strong>{accounts.length}</strong>
          <small>users collection</small>
        </article>

        <article className="admin-stat">
          <span>Registered users</span>
          <strong>{regularCount}</strong>
          <small>ไม่รวม Demo / Admin</small>
        </article>

        <article className="admin-stat">
          <span>Active users</span>
          <strong>{activeCount}</strong>
          <small>app access enabled</small>
        </article>
      </section>

      <section className="admin-card section-space">
        <div className="admin-card-head admin-users-head">
          <div>
            <p className="eyebrow">USER MANAGEMENT</p>
            <h2>Firestore users</h2>
            <p>ข้อมูลจริงจาก collection users — ไม่อ่าน localStorage แล้ว</p>
          </div>

          <div className="admin-users-tools">
            <div className="admin-search">
              <input
                placeholder="ค้นหาชื่อ ร้าน อีเมล Plan หรือ Status..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="button secondary"
              onClick={() => void loadUsers()}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <div className="auth-error admin-users-error">{error}</div>}

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Store</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last login</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      กำลังโหลด User จาก Firestore...
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((account) => {
                  const system = isSystemAccount(account);

                  return (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.displayName}</strong>
                        <span>{account.email}</span>

                        {system && (
                          <span className="admin-system-badge">SYSTEM</span>
                        )}
                      </td>

                      <td>{account.storeName}</td>

                      <td>{account.plan}</td>

                      <td>
                        <span className={`admin-status ${account.status}`}>
                          {account.status}
                        </span>
                      </td>

                      <td>{formatDate(account.createdAt)}</td>

                      <td>{formatDate(account.lastLoginAt)}</td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-mini-button"
                            disabled={system || updatingId === account.id}
                            onClick={() => void toggleStatus(account)}
                          >
                            {system
                              ? "Protected"
                              : updatingId === account.id
                                ? "Saving..."
                                : account.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">ไม่พบ User ใน Firestore</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card section-space">
        <div className="admin-card-head">
          <div>
            <p className="eyebrow">ACCESS MODEL</p>
            <h2>System accounts</h2>
            <p>บัญชีระบบถูกป้องกันไม่ให้ Deactivate จากหน้านี้</p>
          </div>
        </div>

        <div className="system-account-grid">
          <div>
            <span>Demo</span>
            <strong>{DEMO_EMAIL}</strong>
            <small>Protected demo account</small>
          </div>

          <div>
            <span>Admin</span>
            <strong>{ADMIN_EMAIL}</strong>
            <small>
              Admin access comes from Firebase Auth + Firestore admin rule
            </small>
          </div>
        </div>

        <div className="admin-users-note">
          <strong>หมายเหตุเรื่อง Delete</strong>
          <p>
            เวอร์ชันนี้ตั้งใจไม่ลบ Firebase Authentication user จาก browser
            ปุ่มจัดการจึงเป็น Activate / Deactivate เท่านั้น การลบ Auth user
            จริงควรทำผ่าน Firebase Admin SDK หรือ Cloud Function ฝั่ง server
          </p>
        </div>
      </section>
    </div>
  );
}
