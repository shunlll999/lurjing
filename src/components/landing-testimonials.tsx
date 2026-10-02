"use client";

import { StarRating } from "@/components/star-rating";

const mockTestimonials = [
  {
    id: "mock-1",
    displayName: "ร้าน Beauty Demo",
    storeName: "TikTok Shop + Shopee",
    rating: 5,
    message:
      "เมื่อก่อนดูแต่ยอดขาย พอเห็นว่าค่า Ads กับ Affiliate กินไปเท่าไร ถึงเข้าใจว่าทำไมขายเยอะแต่เงินไม่เหลือ",
  },
  {
    id: "mock-2",
    displayName: "ร้าน Fashion Demo",
    storeName: "Shopee + Lazada",
    rating: 5,
    message:
      "สิ่งที่ชอบคือไม่ต้องเปิดหลายรายงาน แค่เห็น Margin ของแต่ละ Platform ก็รู้เลยว่าควรไปแก้ตรงไหนก่อน",
  },
  {
    id: "mock-3",
    displayName: "ร้าน Home & Living Demo",
    storeName: "Marketplace Seller",
    rating: 4,
    message:
      "Simulator ทำให้เห็นก่อนเข้าร่วมโปรว่า ถ้าลดราคาเพิ่มอีกนิดเดียวอาจกลายเป็นขายขาดทุน",
  },
];

export function LandingTestimonials() {
  return (
    <section className="landing-section testimonial-section">
      <div className="landing-section-head testimonial-head">
        <div>
          <span>
            ตัวอย่างจาก POC
          </span>
          <h2>
            สิ่งที่คนขายอยากเห็น
            ไม่ใช่แค่ยอดขาย
          </h2>
          <p>
            ตอนนี้ Landing Page
            ยังไม่แสดง Feedback จริงจากผู้ใช้
            จนกว่าจะเปิดใช้งานภายหลัง
          </p>
        </div>
      </div>

      <div className="testimonial-grid">
        {mockTestimonials.map(
          (item) => (
            <article
              className="testimonial-card"
              key={item.id}
            >
              <div className="testimonial-card-top">
                <StarRating
                  value={item.rating}
                  readonly
                  size="sm"
                />
                <span className="testimonial-type mock">
                  DEMO
                </span>
              </div>

              <div className="testimonial-mark">
                “
              </div>
              <p>{item.message}</p>

              <div className="testimonial-person">
                <div className="testimonial-avatar">
                  {item.displayName.slice(
                    0,
                    1,
                  )}
                </div>
                <div>
                  <strong>
                    {item.displayName}
                  </strong>
                  <span>
                    {item.storeName}
                  </span>
                </div>
              </div>
            </article>
          ),
        )}
      </div>

      <div className="testimonial-disclaimer">
        * ข้อความชุดนี้เป็น Demo สำหรับ POC
        ไม่ใช่รีวิวลูกค้าจริง
      </div>
    </section>
  );
}
