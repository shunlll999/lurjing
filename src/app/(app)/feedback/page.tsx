"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import { StarRating } from "@/components/star-rating";
import {
  getFeedbackErrorMessage,
  listMyFeedback,
  submitFeedback,
} from "@/lib/feedback";
import { trackImportantEvent } from "@/lib/product-analytics";
import type { FeedbackItem } from "@/types/feedback";

export default function FeedbackPage() {
  const {
    user,
    ready: authReady,
  } = useAuth();

  const [rating, setRating] =
    useState(5);

  const [message, setMessage] =
    useState("");

  const [
    allowPublic,
    setAllowPublic,
  ] = useState(true);

  const [
    myFeedback,
    setMyFeedback,
  ] = useState<FeedbackItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const loadFeedback =
    useCallback(async () => {
      if (!authReady) {
        return;
      }

      if (!user) {
        setMyFeedback([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const items =
          await listMyFeedback(
            user.id,
          );

        setMyFeedback(items);
      } catch (loadError) {
        console.warn(
          "[Feedback] load failed",
          loadError,
        );

        setError(
          getFeedbackErrorMessage(
            loadError,
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [
      authReady,
      user,
    ]);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (submitting) return;

    if (!user) {
      setError(
        "ไม่พบ Firebase session กรุณา Login ใหม่",
      );
      return;
    }

    const cleanMessage =
      message.trim();

    if (
      cleanMessage.length < 10
    ) {
      setError(
        "กรุณาเขียน Feedback อย่างน้อย 10 ตัวอักษร",
      );
      return;
    }

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      await submitFeedback(
        user,
        {
          rating,
          message:
            cleanMessage,
          allowPublic,
        },
      );

      // Analytics failure must never block Feedback submission.
      void trackImportantEvent(
        "feedback_submitted",
        user,
        {
          rating,
          allow_public:
            allowPublic,
        },
      );

      setMessage("");
      setRating(5);
      setAllowPublic(true);
      setSubmitted(true);

      await loadFeedback();

      window.setTimeout(
        () =>
          setSubmitted(false),
        2500,
      );
    } catch (submitError) {
      console.warn(
        "[Feedback] submit failed",
        submitError,
      );

      setError(
        getFeedbackErrorMessage(
          submitError,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <section className="card feedback-hero">
        <div>
          <p className="eyebrow">
            PRODUCT FEEDBACK
          </p>

          <h2>
            ช่วยบอกหน่อยว่า “เหลือจริง”
            ใช้แล้วเป็นยังไง
          </h2>

          <p className="muted">
            Feedback จะถูกเก็บใน Firebase Firestore
            และแสดงให้ Admin ตรวจสอบก่อน
            โดยตอนนี้ยังไม่ถูกนำไปแสดงบน Landing Page
          </p>
        </div>

        <div className="feedback-summary-badge">
          <span>
            Feedback ของคุณ
          </span>
          <strong>
            {myFeedback.length}
          </strong>
          <small>ครั้ง</small>
        </div>
      </section>

      <section className="feedback-layout section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                RATE EXPERIENCE
              </p>
              <h2>
                ประสบการณ์โดยรวม
              </h2>
            </div>
          </div>

          <form
            className="feedback-form"
            onSubmit={submit}
          >
            <div className="feedback-rating-box">
              <span>ให้คะแนน</span>

              <StarRating
                value={rating}
                onChange={setRating}
                size="lg"
              />

              <strong>
                {rating}.0 / 5
              </strong>
            </div>

            <label className="feedback-field">
              <span>
                ความคิดเห็น
              </span>

              <textarea
                required
                minLength={10}
                maxLength={600}
                rows={7}
                value={message}
                onChange={(event) => {
                  setMessage(
                    event.target.value,
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="เช่น ชอบที่เห็นกำไรจริงแยก Platform ได้ แต่ยังอยากให้ Import ง่ายขึ้น..."
              />

              <small>
                {message.length}/600 ตัวอักษร
                {message.trim().length >
                  0 &&
                message.trim().length <
                  10
                  ? " • อย่างน้อย 10 ตัวอักษร"
                  : ""}
              </small>
            </label>

            <label className="public-feedback-check">
              <input
                type="checkbox"
                checked={
                  allowPublic
                }
                onChange={(event) =>
                  setAllowPublic(
                    event.target.checked,
                  )
                }
              />

              <span>
                อนุญาตให้ Admin
                เก็บสถานะว่า Feedback
                นี้สามารถนำไปใช้เป็น Testimonial
                ได้ในอนาคต
              </span>
            </label>

            <div className="feedback-owner-preview">
              <span>
                Feedback จาก
              </span>
              <strong>
                {user?.displayName ??
                  "กำลังโหลด..."}
              </strong>
              <small>
                {user?.storeName ?? ""}
              </small>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="button primary feedback-submit"
              disabled={
                submitting ||
                !authReady ||
                !user
              }
            >
              {submitting
                ? "กำลังส่ง..."
                : "ส่ง Feedback"}
            </button>

            {submitted && (
              <div className="feedback-success">
                ขอบคุณครับ ✓ Feedback
                ถูกบันทึกลง Firestore แล้ว
                และ Admin สามารถดูได้
              </div>
            )}
          </form>
        </article>

        <aside className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                YOUR FEEDBACK
              </p>
              <h2>
                ความคิดเห็นที่ผ่านมา
              </h2>
            </div>
          </div>

          <div className="feedback-history">
            {loading ? (
              <div className="empty-feedback">
                กำลังโหลด Feedback...
              </div>
            ) : myFeedback.length ===
              0 ? (
              <div className="empty-feedback">
                ยังไม่มี Feedback
                ลองส่งความคิดเห็นแรกของคุณได้เลย
              </div>
            ) : (
              myFeedback.map(
                (item) => (
                  <article
                    key={item.id}
                    className="feedback-history-card"
                  >
                    <div className="feedback-history-head">
                      <StarRating
                        value={
                          item.rating
                        }
                        readonly
                        size="sm"
                      />

                      <span>
                        {new Intl.DateTimeFormat(
                          "th-TH",
                          {
                            dateStyle:
                              "medium",
                          },
                        ).format(
                          new Date(
                            item.createdAt,
                          ),
                        )}
                      </span>
                    </div>

                    <p>
                      {item.message}
                    </p>

                    <div className="feedback-history-status">
                      <span className="private">
                        {item.moderationStatus ===
                        "approved"
                          ? "Admin อนุมัติแล้ว"
                          : item.moderationStatus ===
                              "rejected"
                            ? "ไม่ผ่านการอนุมัติ"
                            : "รอ Admin ตรวจสอบ"}
                      </span>
                    </div>
                  </article>
                ),
              )
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
