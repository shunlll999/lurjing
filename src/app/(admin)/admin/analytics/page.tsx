"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listAnalyticsEvents } from "@/lib/product-analytics";
import type { AnalyticsEventItem } from "@/types/analytics";

const eventLabels: Record<string, string> = {
  user_registered: "สมัครสมาชิก",
  user_login: "เข้าสู่ระบบ",
  profile_updated: "แก้ไข Profile",
  csv_imported: "Import CSV",
  feedback_submitted: "ส่ง Feedback",
  ai_insight_requested: "ใช้ AI Owner Beta",
};

function eventLabel(name: string) {
  return eventLabels[name] ?? name;
}

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setEvents(await listAnalyticsEvents(200));
    } catch (loadError) {
      console.error("[Admin Analytics] load failed", loadError);

      setError("โหลด Product Analytics จาก Firestore ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    const users = new Set(events.map((item) => item.userId));

    const last24h = Date.now() - 24 * 60 * 60 * 1000;

    const recent = events.filter(
      (item) => new Date(item.createdAt).getTime() >= last24h,
    ).length;

    const counts = events.reduce<Record<string, number>>((acc, item) => {
      acc[item.eventName] = (acc[item.eventName] ?? 0) + 1;
      return acc;
    }, {});

    return {
      users: users.size,
      recent,
      counts,
    };
  }, [events]);

  return (
    <div className="admin-page">
      <section className="admin-card analytics-info-card">
        <div className="admin-card-head">
          <div>
            <p className="eyebrow">PRODUCT ANALYTICS</p>
            <h2>พฤติกรรมการใช้งาน LurJing</h2>
            <p>
              GA4 เก็บ Page View และ Click แบบละเอียด ส่วนตารางด้านล่าง คือ
              Important Events ที่เก็บใน Firestore เพื่อให้ Admin
              ดูในระบบได้โดยตรง
            </p>
          </div>

          <button className="button secondary" onClick={() => void load()}>
            Refresh
          </button>
        </div>

        <div className="analytics-privacy-note">
          GA4 จะไม่รับ email, ชื่อผู้ใช้ หรือชื่อร้านจากโค้ดชุดนี้ โดยใช้
          Firebase UID เป็น User ID แบบ pseudonymous เท่านั้น
        </div>
      </section>

      <section className="admin-stat-grid section-space">
        <article className="admin-stat">
          <span>Important events</span>
          <strong>{events.length}</strong>
          <small>latest 200 events</small>
        </article>

        <article className="admin-stat">
          <span>Unique users</span>
          <strong>{summary.users}</strong>
          <small>from Firestore events</small>
        </article>

        <article className="admin-stat">
          <span>Last 24 hours</span>
          <strong>{summary.recent}</strong>
          <small>important events</small>
        </article>

        <article className="admin-stat">
          <span>CSV imports</span>
          <strong>{summary.counts.csv_imported ?? 0}</strong>
          <small>successful imports</small>
        </article>

        <article className="admin-stat">
          <span>AI Owner Beta</span>
          <strong>{summary.counts.ai_insight_requested ?? 0}</strong>
          <small>insight requests</small>
        </article>
      </section>

      <section className="admin-grid section-space">
        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">EVENT BREAKDOWN</p>
              <h2>กิจกรรมสำคัญ</h2>
            </div>
          </div>

          <div className="analytics-breakdown">
            {Object.entries(summary.counts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <div key={name} className="analytics-breakdown-row">
                  <span>{eventLabel(name)}</span>
                  <strong>{count}</strong>
                </div>
              ))}

            {!events.length && !loading && (
              <div className="admin-empty">ยังไม่มี Event</div>
            )}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">GA4</p>
              <h2>Full clickstream</h2>
            </div>
          </div>

          <div className="analytics-ga-card">
            <strong>Google Analytics 4</strong>
            <p>
              Page views และ UI clicks ถูกส่งเข้า GA4 โดยตรง เพื่อดู
              Acquisition, Engagement, Pages และ Events แบบเต็ม
            </p>
            <code>ui_click / route_view</code>
            <small>
              Admin page นี้ไม่เรียก Google Analytics Data API โดยตรง
              จึงไม่ต้องฝัง Google service-account credential ไว้ในเว็บ static
            </small>
          </div>
        </article>
      </section>

      <section className="admin-card section-space">
        <div className="admin-card-head">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2>Important Events ล่าสุด</h2>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="admin-table-scroll">
          <table className="admin-table analytics-table">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>User</th>
                <th>Store</th>
                <th>Event</th>
                <th>Page</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>

            <tbody>
              {events.map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(item.createdAt))}
                  </td>

                  <td>
                    <strong>{item.displayName}</strong>
                    <span>{item.userId.slice(0, 8)}…</span>
                  </td>

                  <td>{item.storeName}</td>

                  <td>
                    <span className="analytics-event-chip">
                      {eventLabel(item.eventName)}
                    </span>
                  </td>

                  <td>{item.pagePath || "-"}</td>

                  <td>
                    <code className="analytics-metadata">
                      {Object.keys(item.metadata ?? {}).length
                        ? JSON.stringify(item.metadata)
                        : "-"}
                    </code>
                  </td>
                </tr>
              ))}

              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">ยังไม่มี Analytics Event</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="admin-empty">กำลังโหลด Analytics...</div>}
      </section>
    </div>
  );
}
