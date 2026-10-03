"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { listAdminUsers } from "@/lib/admin-users";
import { listAdminFeedback } from "@/lib/feedback";
import { listAnalyticsEvents } from "@/lib/product-analytics";
import type { UserProfile } from "@/types/auth";
import type { FeedbackItem } from "@/types/feedback";
import type { AnalyticsEventItem } from "@/types/analytics";

export default function AdminOverviewPage() {
  const [accounts, setAccounts] =
    useState<UserProfile[]>([]);
  const [feedback, setFeedback] =
    useState<FeedbackItem[]>([]);
  const [events, setEvents] =
    useState<AnalyticsEventItem[]>([]);

  useEffect(() => {
    void Promise.all([
      listAdminUsers(),
      listAdminFeedback(100),
      listAnalyticsEvents(100),
    ])
      .then(
        ([
          userItems,
          feedbackItems,
          analyticsItems,
        ]) => {
          setAccounts(userItems);
          setFeedback(
            feedbackItems,
          );
          setEvents(
            analyticsItems,
          );
        },
      )
      .catch((error) => {
        console.warn(
          "[Admin Overview] Firestore summary load failed",
          error,
        );
      });
  }, []);

  const stats = useMemo(() => {
    const registered =
      accounts.filter(
        (item) =>
          item.role !== "admin" &&
          !item.isDemo,
      );

    const active =
      registered.filter(
        (item) =>
          item.status === "active",
      ).length;

    const pending =
      feedback.filter(
        (item) =>
          item.moderationStatus ===
          "pending",
      ).length;

    const average =
      feedback.length > 0
        ? feedback.reduce(
            (sum, item) =>
              sum + item.rating,
            0,
          ) / feedback.length
        : 0;

    return {
      registered: registered.length,
      active,
      pending,
      average,
    };
  }, [accounts, feedback]);

  return (
    <div className="admin-page">
      <section className="admin-stat-grid">
        <article className="admin-stat">
          <span>
            Registered users
          </span>
          <strong>
            {stats.registered}
          </strong>
          <small>
            {stats.active} active • Firestore
          </small>
        </article>

        <article className="admin-stat">
          <span>Feedback</span>
          <strong>
            {feedback.length}
          </strong>
          <small>
            {stats.pending} pending
          </small>
        </article>

        <article className="admin-stat">
          <span>
            Important events
          </span>
          <strong>
            {events.length}
          </strong>
          <small>
            latest 100
          </small>
        </article>

        <article className="admin-stat">
          <span>
            Average rating
          </span>
          <strong>
            {stats.average
              ? stats.average.toFixed(
                  1,
                )
              : "-"}
          </strong>
          <small>
            Firestore feedback
          </small>
        </article>
      </section>

      <section className="admin-grid section-space">
        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">
                MODERATION
              </p>
              <h2>
                Feedback ที่รอตรวจ
              </h2>
            </div>
            <Link href="/admin/feedback">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="admin-list">
            {feedback
              .filter(
                (item) =>
                  item.moderationStatus ===
                  "pending",
              )
              .slice(0, 5)
              .map((item) => (
                <div
                  className="admin-list-row"
                  key={item.id}
                >
                  <div>
                    <strong>
                      {item.displayName}
                    </strong>
                    <span>
                      {item.storeName}
                      {" • "}
                      {item.rating} ดาว
                    </span>
                  </div>
                  <p>{item.message}</p>
                </div>
              ))}

            {stats.pending === 0 && (
              <div className="admin-empty">
                ไม่มี Feedback
                ที่รอตรวจสอบ
              </div>
            )}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">
                QUICK ACTIONS
              </p>
              <h2>
                จัดการ Early
              </h2>
            </div>
          </div>

          <div className="admin-action-list">
            <Link href="/admin/users">
              <strong>
                Users
              </strong>
              <span>
                ดูบัญชีผู้ใช้
              </span>
              <b>→</b>
            </Link>

            <Link href="/admin/analytics">
              <strong>
                Product Analytics
              </strong>
              <span>
                GA4 interaction +
                Firestore important events
              </span>
              <b>→</b>
            </Link>

            <Link href="/admin/feedback">
              <strong>
                Feedback
              </strong>
              <span>
                ดูและ Moderate Feedback จริง
              </span>
              <b>→</b>
            </Link>

            <Link href="/admin/settings">
              <strong>
                Settings
              </strong>
              <span>
                เปิด/ปิด Tracking ได้ตลอด
              </span>
              <b>→</b>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
