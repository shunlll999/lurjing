"use client";

import { useEffect, useMemo, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { getPublicFeedback } from "@/lib/feedback";
import type { FeedbackItem } from "@/types/feedback";

const settingsKey = "lurjing:admin-settings";

interface LandingSettings {
  testimonialsEnabled: boolean;
  maxTestimonials: number;
}

const defaults: LandingSettings = {
  testimonialsEnabled: true,
  maxTestimonials: 6,
};

const mockTestimonials = [
  {
    id: "mock-1",
    displayName: "ร้าน Beauty Demo",
    storeName: "TikTok Shop + Shopee",
    rating: 5,
    message:
      "เมื่อก่อนดูแต่ยอดขาย พอเห็นว่าค่า Ads กับ Affiliate กินไปเท่าไร ถึงเข้าใจว่าทำไมขายเยอะแต่เงินไม่เหลือ",
    mock: true,
  },
  {
    id: "mock-2",
    displayName: "ร้าน Fashion Demo",
    storeName: "Shopee + Lazada",
    rating: 5,
    message:
      "สิ่งที่ชอบคือไม่ต้องเปิดหลายรายงาน แค่เห็น Margin ของแต่ละ Platform ก็รู้เลยว่าควรไปแก้ตรงไหนก่อน",
    mock: true,
  },
  {
    id: "mock-3",
    displayName: "ร้าน Home & Living Demo",
    storeName: "Marketplace Seller",
    rating: 4,
    message:
      "Simulator ทำให้เห็นก่อนเข้าร่วมโปรว่า ถ้าลดราคาเพิ่มอีกนิดเดียวอาจกลายเป็นขายขาดทุน",
    mock: true,
  },
];

export function LandingTestimonials() {
  const [submitted, setSubmitted] = useState<FeedbackItem[]>([]);
  const [settings, setSettings] = useState<LandingSettings>(defaults);

  useEffect(() => {
    setSubmitted(getPublicFeedback());
    try {
      const raw = window.localStorage.getItem(settingsKey);
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {
      setSettings(defaults);
    }
  }, []);

  const cards = useMemo(() => {
    const real = submitted.map((item) => ({
      id: item.id,
      displayName: item.displayName,
      storeName: item.storeName,
      rating: item.rating,
      message: item.message,
      mock: false,
    }));

    const source = real.length ? real : mockTestimonials;
    return source.slice(0, settings.maxTestimonials);
  }, [submitted, settings.maxTestimonials]);

  const average = useMemo(() => {
    if (!submitted.length) return null;
    return (
      submitted.reduce((sum, item) => sum + item.rating, 0) / submitted.length
    );
  }, [submitted]);

  if (!settings.testimonialsEnabled) return null;

  return (
    <section className="landing-section testimonial-section">
      <div className="landing-section-head testimonial-head">
        <div>
          <span>เสียงจากผู้ทดลอง</span>
          <h2>สิ่งที่คนขายอยากเห็น ไม่ใช่แค่ยอดขาย</h2>
          <p>
            เฉพาะ Feedback ที่ผู้ใช้อนุญาตและ Admin Approve แล้วเท่านั้น
          </p>
        </div>

        {average !== null && (
          <div className="testimonial-average">
            <strong>{average.toFixed(1)}</strong>
            <StarRating value={Math.round(average)} readonly size="sm" />
            <span>{submitted.length} รีวิว</span>
          </div>
        )}
      </div>

      <div className="testimonial-grid">
        {cards.map((item) => (
          <article className="testimonial-card" key={item.id}>
            <div className="testimonial-card-top">
              <StarRating value={item.rating} readonly size="sm" />
              <span
                className={
                  item.mock
                    ? "testimonial-type mock"
                    : "testimonial-type real"
                }
              >
                {item.mock ? "DEMO" : "VERIFIED"}
              </span>
            </div>

            <div className="testimonial-mark">“</div>
            <p>{item.message}</p>

            <div className="testimonial-person">
              <div className="testimonial-avatar">
                {item.displayName.slice(0, 1)}
              </div>
              <div>
                <strong>{item.displayName}</strong>
                <span>{item.storeName}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {submitted.length === 0 && (
        <div className="testimonial-disclaimer">
          * ยังไม่มี Feedback จริงที่ผ่านการอนุมัติ จึงใช้ข้อความ Demo สำหรับ POC
        </div>
      )}
    </section>
  );
}
