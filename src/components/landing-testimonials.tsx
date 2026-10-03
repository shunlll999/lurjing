"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { StarRating } from "@/components/star-rating";
import { listPublicFeaturedFeedback } from "@/lib/feedback";
import type { FeedbackItem } from "@/types/feedback";

function TestimonialAvatar({ item }: { item: FeedbackItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = item.storeAvatarUrl?.trim();
  const initial =
    item.displayName?.trim().slice(0, 1).toUpperCase() ||
    item.storeName?.trim().slice(0, 1).toUpperCase() ||
    "L";

  if (avatarUrl && !imageFailed) {
    return (
      <div className="testimonial-avatar has-image">
        <img
          src={avatarUrl}
          alt={`รูปโปรไฟล์ร้าน ${item.storeName}`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="testimonial-avatar" aria-label={`โปรไฟล์ ${item.storeName}`}>
      {initial}
    </div>
  );
}

export function LandingTestimonials() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const feedback = await listPublicFeaturedFeedback(6);

        if (!cancelled) {
          setItems(feedback);
        }
      } catch (error) {
        // Landing page must stay usable even when Firestore is unavailable.
        console.warn("[Landing Feedback] public feedback unavailable", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (!items.length) return null;

    const total = items.reduce((sum, item) => sum + item.rating, 0);
    return (total / items.length).toFixed(1);
  }, [items]);

  return (
    <section className="landing-section testimonial-section">
      <div className="landing-section-head testimonial-head feedback-invite-head">
        <div>
          <span>ใช้ฟรีช่วง Early • แล้วช่วยเราทำให้เหลือจริงดีขึ้น</span>
          <h2>เรากำลังรอ Feedback จากคุณ เพื่อทำให้เหลือจริงตอบโจทย์มากขึ้น</h2>
          <p>
            ทุกความคิดเห็นของคุณจะถูกนำไปใช้พัฒนา Product ให้ใช้ง่ายขึ้น
            แม่นยำขึ้น และช่วยให้การตัดสินใจของร้านคุณดีขึ้นจริง
          </p>
        </div>

        {averageRating ? (
          <div className="testimonial-average" aria-label={`คะแนนเฉลี่ย ${averageRating} จาก 5`}>
            <strong>{averageRating}</strong>
            <StarRating value={Math.round(Number(averageRating))} readonly size="sm" />
            <span>จาก Feedback ที่ได้รับอนุญาตให้เผยแพร่</span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="testimonial-empty-state" aria-live="polite">
          <span className="testimonial-empty-icon">“</span>
          <div>
            <strong>กำลังโหลด Feedback จากผู้ใช้งาน</strong>
            <p>อีกสักครู่เราจะแสดงเฉพาะ Feedback จริงที่ได้รับอนุญาตให้เผยแพร่</p>
          </div>
        </div>
      ) : items.length ? (
        <>
          <div className="testimonial-grid">
            {items.map((item) => (
              <article className="testimonial-card" key={item.id}>
                <div className="testimonial-card-top">
                  <StarRating value={item.rating} readonly size="sm" />
                  <span className="testimonial-type real">ผู้ใช้จริง</span>
                </div>

                <div className="testimonial-mark">“</div>
                <p>{item.message}</p>

                <div className="testimonial-person">
                  <TestimonialAvatar item={item} />
                  <div>
                    <strong>{item.displayName}</strong>
                    <span>{item.storeName}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* <div className="testimonial-disclaimer">
            แสดงเฉพาะ Feedback ที่ผู้ใช้อนุญาตให้เผยแพร่และผ่านการตรวจสอบจากทีมเหลือจริงแล้ว
          </div> */}
        </>
      ) : (
        <div className="testimonial-empty-state testimonial-feedback-cta">
          <span className="testimonial-empty-icon">“</span>
          <div>
            <strong>พื้นที่นี้กำลังรอเสียงจากผู้ใช้จริงคนแรก</strong>
            <p>
              ลองใช้เหลือจริงแล้วบอกเราได้ตรง ๆ ว่าอะไรช่วยคุณได้
              อะไรยังไม่ตอบโจทย์ และอะไรที่อยากให้เราทำต่อ
            </p>
            <div className="testimonial-empty-actions">
              <Link href="/register" className="button primary">
                เริ่มใช้ฟรี
              </Link>
              <Link href="/login?next=/feedback" className="button secondary">
                ส่ง Feedback ให้เรา
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
