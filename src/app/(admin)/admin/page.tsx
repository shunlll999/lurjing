"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readAccounts } from "@/lib/auth";
import { readFeedback } from "@/lib/feedback";
import type { StoredAccount } from "@/types/auth";
import type { FeedbackItem } from "@/types/feedback";

export default function AdminOverviewPage() {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    setAccounts(readAccounts());
    setFeedback(readFeedback());
  }, []);

  const stats = useMemo(() => {
    const active = accounts.filter((item) => item.status === "active").length;
    const pending = feedback.filter((item) => item.moderationStatus === "pending").length;
    const approved = feedback.filter((item) => item.moderationStatus === "approved").length;
    const featured = feedback.filter((item) => item.featured).length;
    const average =
      feedback.length > 0
        ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        : 0;

    return { active, pending, approved, featured, average };
  }, [accounts, feedback]);

  return (
    <div className="admin-page">
      <section className="admin-stat-grid">
        <article className="admin-stat">
          <span>Registered users</span>
          <strong>{accounts.length}</strong>
          <small>{stats.active} active</small>
        </article>
        <article className="admin-stat">
          <span>Feedback</span>
          <strong>{feedback.length}</strong>
          <small>{stats.pending} pending</small>
        </article>
        <article className="admin-stat">
          <span>Approved</span>
          <strong>{stats.approved}</strong>
          <small>{stats.featured} featured</small>
        </article>
        <article className="admin-stat">
          <span>Average rating</span>
          <strong>{stats.average ? stats.average.toFixed(1) : "-"}</strong>
          <small>all feedback</small>
        </article>
      </section>

      <section className="admin-grid section-space">
        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">MODERATION</p>
              <h2>Feedback ที่รอตรวจ</h2>
            </div>
            <Link href="/admin/feedback">ดูทั้งหมด →</Link>
          </div>

          <div className="admin-list">
            {feedback
              .filter((item) => item.moderationStatus === "pending")
              .slice(0, 5)
              .map((item) => (
                <div className="admin-list-row" key={item.id}>
                  <div>
                    <strong>{item.displayName}</strong>
                    <span>{item.storeName} • {item.rating} ดาว</span>
                  </div>
                  <p>{item.message}</p>
                </div>
              ))}

            {stats.pending === 0 && (
              <div className="admin-empty">ไม่มี Feedback ที่รอตรวจสอบ</div>
            )}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">QUICK ACTIONS</p>
              <h2>จัดการ POC</h2>
            </div>
          </div>

          <div className="admin-action-list">
            <Link href="/admin/users">
              <strong>Users</strong>
              <span>เปิด/ปิด และลบบัญชีผู้ใช้</span>
              <b>→</b>
            </Link>
            <Link href="/admin/feedback">
              <strong>Feedback & Testimonials</strong>
              <span>Approve / Reject / Feature บน Landing</span>
              <b>→</b>
            </Link>
            <Link href="/admin/settings">
              <strong>POC Settings</strong>
              <span>ตั้งค่า Landing และรีเซ็ตข้อมูล Demo</span>
              <b>→</b>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
