"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StarRating } from "@/components/star-rating";
import {
  listAdminFeedback,
  moderateFeedback,
  removeFeedback,
  setFeedbackFeatured,
} from "@/lib/feedback";
import type {
  FeedbackItem,
  FeedbackModerationStatus,
} from "@/types/feedback";

type FilterKey =
  | "all"
  | FeedbackModerationStatus
  | "featured";

export default function AdminFeedbackPage() {
  const [items, setItems] =
    useState<FeedbackItem[]>([]);
  const [filter, setFilter] =
    useState<FilterKey>("all");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const reload =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        setItems(
          await listAdminFeedback(),
        );
      } catch (loadError) {
        console.error(
          "[Admin Feedback] load failed",
          loadError,
        );
        setError(
          "โหลด Feedback จาก Firestore ไม่สำเร็จ",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const visible = useMemo(() => {
    if (filter === "all") {
      return items;
    }

    if (filter === "featured") {
      return items.filter(
        (item) => item.featured,
      );
    }

    return items.filter(
      (item) =>
        item.moderationStatus ===
        filter,
    );
  }, [items, filter]);

  const moderate = async (
    item: FeedbackItem,
    moderationStatus:
      FeedbackModerationStatus,
  ) => {
    await moderateFeedback(
      item.id,
      moderationStatus,
      item.featured,
    );
    await reload();
  };

  const toggleFeatured = async (
    item: FeedbackItem,
  ) => {
    await setFeedbackFeatured(
      item,
      !item.featured,
    );
    await reload();
  };

  const remove = async (
    item: FeedbackItem,
  ) => {
    if (
      !window.confirm(
        `ลบ Feedback จาก ${item.displayName} หรือไม่?`,
      )
    ) {
      return;
    }

    await removeFeedback(item.id);
    await reload();
  };

  return (
    <div className="admin-page">
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="eyebrow">
              FEEDBACK MODERATION
            </p>
            <h2>
              Feedback ทั้งหมด
            </h2>
            <p>
              ข้อมูลจริงจาก Firestore
              สำหรับ Admin เท่านั้น
              ตอนนี้ยังไม่แสดง Feedback
              จริงบน Landing Page
            </p>
          </div>

          <button
            className="button secondary"
            onClick={() =>
              void reload()
            }
          >
            Refresh
          </button>
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
              className={
                filter === key
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  key as FilterKey,
                )
              }
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="admin-feedback-list">
          {loading ? (
            <div className="admin-empty">
              กำลังโหลด Feedback...
            </div>
          ) : (
            visible.map((item) => (
              <article
                className="admin-feedback-card"
                key={item.id}
              >
                <div className="admin-feedback-meta">
                  <div className="admin-feedback-user">
                    <span>
                      {item.displayName.slice(
                        0,
                        1,
                      )}
                    </span>
                    <div>
                      <strong>
                        {item.displayName}
                      </strong>
                      <small>
                        {item.storeName}
                      </small>
                    </div>
                  </div>

                  <div className="admin-feedback-rating">
                    <StarRating
                      value={item.rating}
                      readonly
                      size="sm"
                    />
                    <span>
                      {item.rating}.0
                    </span>
                  </div>
                </div>

                <p className="admin-feedback-message">
                  {item.message}
                </p>

                <div className="admin-feedback-flags">
                  <span
                    className={`admin-status ${item.moderationStatus}`}
                  >
                    {
                      item.moderationStatus
                    }
                  </span>

                  <span
                    className={
                      item.allowPublic
                        ? "public-flag"
                        : "private-flag"
                    }
                  >
                    {item.allowPublic
                      ? "Future testimonial consent"
                      : "Private"}
                  </span>

                  {item.featured && (
                    <span className="featured-flag">
                      FEATURED
                    </span>
                  )}
                </div>

                <div className="admin-feedback-actions">
                  <button
                    className="admin-mini-button success"
                    onClick={() =>
                      void moderate(
                        item,
                        "approved",
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className={
                      item.featured
                        ? "admin-mini-button featured"
                        : "admin-mini-button"
                    }
                    disabled={
                      !item.allowPublic
                    }
                    title={
                      item.allowPublic
                        ? ""
                        : "ผู้ใช้ไม่ได้อนุญาตให้นำ Feedback ไปใช้เป็น Testimonial"
                    }
                    onClick={() =>
                      void toggleFeatured(
                        item,
                      )
                    }
                  >
                    {item.featured
                      ? "Unfeature"
                      : "Mark Featured"}
                  </button>

                  <button
                    className="admin-mini-button"
                    onClick={() =>
                      void moderate(
                        item,
                        "rejected",
                      )
                    }
                  >
                    Reject
                  </button>

                  <button
                    className="admin-mini-button danger"
                    onClick={() =>
                      void remove(item)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}

          {!loading &&
            visible.length === 0 && (
              <div className="admin-empty">
                ไม่มี Feedback
                ในสถานะนี้
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
