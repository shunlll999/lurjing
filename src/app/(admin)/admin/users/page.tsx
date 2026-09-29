"use client";

import { useEffect, useMemo, useState } from "react";
import { readAccounts, writeAccounts } from "@/lib/auth";
import type { StoredAccount } from "@/types/auth";

export default function AdminUsersPage() {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setAccounts(readAccounts());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;

    return accounts.filter((account) =>
      [account.displayName, account.storeName, account.email].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [accounts, query]);

  const toggleStatus = (id: string) => {
    const next = readAccounts().map((account) =>
      account.id === id
        ? {
            ...account,
            status:
              account.status === "active"
                ? ("disabled" as const)
                : ("active" as const),
          }
        : account,
    );
    writeAccounts(next);
    setAccounts(next);
  };

  const remove = (id: string) => {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    if (!window.confirm(`ลบบัญชี ${account.email} ออกจาก POC หรือไม่?`)) return;

    const next = readAccounts().filter((item) => item.id !== id);
    writeAccounts(next);
    setAccounts(next);
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <div className="admin-card-head admin-users-head">
          <div>
            <p className="eyebrow">USER MANAGEMENT</p>
            <h2>Registered users</h2>
            <p>บัญชีที่ผู้ทดลองสมัครเองใน browser นี้</p>
          </div>

          <div className="admin-search">
            <input
              placeholder="ค้นหาชื่อ ร้าน หรืออีเมล..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Store</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => (
                <tr key={account.id}>
                  <td>
                    <strong>{account.displayName}</strong>
                    <span>{account.email}</span>
                  </td>
                  <td>{account.storeName}</td>
                  <td>{account.plan}</td>
                  <td>
                    <span className={`admin-status ${account.status}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                    }).format(new Date(account.createdAt))}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-mini-button"
                        onClick={() => toggleStatus(account.id)}
                      >
                        {account.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="admin-mini-button danger"
                        onClick={() => remove(account.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">ไม่พบ User</div>
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
            <p className="eyebrow">SYSTEM ACCOUNTS</p>
            <h2>POC accounts</h2>
          </div>
        </div>

        <div className="system-account-grid">
          <div>
            <span>Demo</span>
            <strong>demo@lurjing.com</strong>
            <small>Protected system account</small>
          </div>
          <div>
            <span>Admin</span>
            <strong>admin@lurjing.com</strong>
            <small>Protected system account</small>
          </div>
        </div>
      </section>
    </div>
  );
}
