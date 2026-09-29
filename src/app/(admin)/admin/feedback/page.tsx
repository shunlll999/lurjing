"use client";

import { useEffect, useMemo, useState } from "react";
import { StarRating } from "@/components/star-rating";
import {
  deleteFeedback,
  readFeedback,
  updateFeedback,
} from "@/lib/feedback";
import type {
  FeedbackItem,
  FeedbackModerationStatus,
} from "@/types/feedback";

type FilterKey = "all" | FeedbackModerationStatus | "featured";

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  const reload = () => setItems(readFeedback());

  useEffect(() => {
    reload();
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "featured") return items.filter((item) => item.featured);
    return items.filter((item) => item.moderationStatus === filter);
  }, [items, filter]);

  const moderate = (
    id: string,
    moderationStatus: FeedbackModerationStatus,
  ) => {
    updateFeedback(id, {
      moderationStatus,
      featured:
        moderationStatus === "approved"
          ? items.find((item) => item.id === id)?.featured ?? false
          : false,
    });
    reload();
  };

  const toggleFeatured = (item: FeedbackItem) => {
    updateFeedback(item.id, {
      moderationStatus: "approved",
      allowPublic: true,
      featured: !item.featured,
    });
    reload();
  };

  const remove = (item: FeedbackItem) => {
    if (!window.confirm(`ลบ Feedback จาก ${item.displayName} หรือไม่?`)) return;
    deleteFeedback(item.id);
    reload();
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="eyebrow">FEEDBACK MODERATION</p>
            <h2>Feedback ทั้งหมด</h2>
            <p>เลือก Feedback ที่ดีให้ขึ้น Landing Page และเลือก Featured ได้</p>
          </div>
        </div>

        <div className="admin-filter-tabs">
          {[
            ["all", "ทั้งหมด"],
            ["pending", "รอตรวจ"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["featured", "Featured"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key as FilterKey)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-feedback-list">
          {visible.map((item) => (
            <article className="admin-feedback-card" key={item.id}>
              <div className="admin-feedback-meta">
                <div className="admin-feedback-user">
                  <span>{item.displayName.slice(0, 1)}</span>
                  <div>
                    <strong>{item.displayName}</strong>
                    <small>{item.storeName}</small>
                  </div>
                </div>

                <div className="admin-feedback-rating">
                  <StarRating value={item.rating} readonly size="sm" />
                  <span>{item.rating}.0</span>
                </div>
              </div>

              <p className="admin-feedback-message">{item.message}</p>

              <div className="admin-feedback-flags">
                <span className={`admin-status ${item.moderationStatus}`}>
                  {item.moderationStatus}
                </span>
                <span className={item.allowPublic ? "public-flag" : "private-flag"}>
                  {item.allowPublic ? "Public consent" : "Private"}
                </span>
                {item.featured && <span className="featured-flag">FEATURED</span>}
              </div>

              <div className="admin-feedback-actions">
                <button
                  className="admin-mini-button success"
                  onClick={() => moderate(item.id, "approved")}
                >
                  Approve
                </button>
                <button
                  className={
                    item.featured
                      ? "admin-mini-button featured"
                      : "admin-mini-button"
                  }
                  onClick={() => toggleFeatured(item)}
                >
                  {item.featured ? "Unfeature" : "Feature on Landing"}
                </button>
                <button
                  className="admin-mini-button"
                  onClick={() => moderate(item.id, "rejected")}
                >
                  Reject
                </button>
                <button
                  className="admin-mini-button danger"
                  onClick={() => remove(item)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {visible.length === 0 && (
            <div className="admin-empty">ไม่มี Feedback ในสถานะนี้</div>
          )}
        </div>
      </section>
    </div>
  );
}
