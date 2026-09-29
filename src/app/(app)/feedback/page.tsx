"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { StarRating } from "@/components/star-rating";
import { addFeedback, readFeedback } from "@/lib/feedback";
import type { FeedbackItem } from "@/types/feedback";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [allowPublic, setAllowPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [version, setVersion] = useState(0);

  const myFeedback = useMemo(
    () =>
      readFeedback().filter((item) => item.userId === user?.id),
    [user?.id, version],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (!user || !message.trim()) return;

    const item: FeedbackItem = {
      id: crypto.randomUUID(),
      userId: user.id,
      displayName: user.displayName,
      storeName: user.storeName,
      rating,
      message: message.trim(),
      allowPublic,
      moderationStatus: "pending",
      featured: false,
      createdAt: new Date().toISOString(),
    };

    addFeedback(item);
    setMessage("");
    setRating(5);
    setAllowPublic(true);
    setSubmitted(true);
    setVersion((value) => value + 1);

    window.setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="feedback-page">
      <section className="card feedback-hero">
        <div>
          <p className="eyebrow">PRODUCT FEEDBACK</p>
          <h2>ช่วยบอกหน่อยว่า “เหลือจริง” ใช้แล้วเป็นยังไง</h2>
          <p className="muted">
            ให้ดาวและบอกสิ่งที่ชอบหรืออยากให้ปรับ เพื่อช่วยกำหนดว่าเราควรพัฒนาอะไรต่อ
          </p>
        </div>

        <div className="feedback-summary-badge">
          <span>Feedback ของคุณ</span>
          <strong>{myFeedback.length}</strong>
          <small>ครั้ง</small>
        </div>
      </section>

      <section className="feedback-layout section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">RATE EXPERIENCE</p>
              <h2>ประสบการณ์โดยรวม</h2>
            </div>
          </div>

          <form className="feedback-form" onSubmit={submit}>
            <div className="feedback-rating-box">
              <span>ให้คะแนน</span>
              <StarRating value={rating} onChange={setRating} size="lg" />
              <strong>{rating}.0 / 5</strong>
            </div>

            <label className="feedback-field">
              <span>ความคิดเห็น</span>
              <textarea
                required
                minLength={10}
                maxLength={600}
                rows={7}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="เช่น ชอบที่เห็นกำไรจริงแยก Platform ได้ แต่ยังอยากให้ Import จาก Shopee ง่ายขึ้น..."
              />
              <small>{message.length}/600 ตัวอักษร</small>
            </label>

            <label className="public-feedback-check">
              <input
                type="checkbox"
                checked={allowPublic}
                onChange={(event) => setAllowPublic(event.target.checked)}
              />
              <span>
                อนุญาตให้นำความคิดเห็นนี้ไปแสดงบน Landing Page เป็น Testimonial
                โดยแสดงชื่อผู้ใช้งานและชื่อร้าน
              </span>
            </label>

            <div className="feedback-owner-preview">
              <span>จะแสดงในชื่อ</span>
              <strong>{user?.displayName}</strong>
              <small>{user?.storeName}</small>
            </div>

            <button
              className="button primary feedback-submit"
              disabled={!message.trim() || message.trim().length < 10}
            >
              ส่ง Feedback
            </button>

            {submitted && (
              <div className="feedback-success">
                ขอบคุณครับ ✓ Feedback ถูกบันทึกแล้ว
                {allowPublic ? " และจะรอ Admin อนุมัติก่อนแสดงบน Landing Page" : ""}
              </div>
            )}
          </form>
        </article>

        <aside className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">YOUR FEEDBACK</p>
              <h2>ความคิดเห็นที่ผ่านมา</h2>
            </div>
          </div>

          <div className="feedback-history">
            {myFeedback.length === 0 ? (
              <div className="empty-feedback">
                ยังไม่มี Feedback ลองส่งความคิดเห็นแรกของคุณได้เลย
              </div>
            ) : (
              myFeedback.map((item) => (
                <article key={item.id} className="feedback-history-card">
                  <div className="feedback-history-head">
                    <StarRating value={item.rating} readonly size="sm" />
                    <span>
                      {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "medium",
                      }).format(new Date(item.createdAt))}
                    </span>
                  </div>

                  <p>{item.message}</p>

                  <div className="feedback-history-status">
                    <span className={item.allowPublic && item.moderationStatus === "approved" ? "public" : "private"}>
                      {!item.allowPublic ? "Private" : item.moderationStatus === "approved" ? "อนุมัติแล้ว" : item.moderationStatus === "rejected" ? "ไม่ผ่านการอนุมัติ" : "รอตรวจสอบ"}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
