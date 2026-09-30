import { LandingTestimonials } from "@/components/landing-testimonials";
import { BrandMark } from "@/components/brand-logo";
import Link from "next/link";

const features = [
  {
    title: "รู้กำไรจริง",
    text: "รวมยอดขาย ต้นทุน ค่าธรรมเนียม Ads Affiliate ส่วนลด และ Refund ไว้ในภาพเดียว",
  },
  {
    title: "เห็นเงินรั่ว",
    text: "เจาะต่อได้ว่า Platform ไหน หรือ SKU ไหน กำลังกิน Margin ของร้าน",
  },
  {
    title: "ลองก่อนทำโปร",
    text: "Simulation ให้เห็นว่าถ้าเข้าร่วม Flash Sale หรือเพิ่ม Affiliate แล้วยังเหลือกำไรไหม",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link href="/" className="landing-brand">
          <BrandMark size={80} />
          <div>
            <strong>เหลือจริง</strong>
            <small>Seller Profit</small>
          </div>
        </Link>

        <nav>
          <a href="#features">ฟีเจอร์</a>
          <a href="#how">ทำงานยังไง</a>
          <Link href="/terms">ข้อตกลง</Link>
        </nav>

        <div className="landing-actions">
          <Link href="/login" className="button secondary">
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className="button primary">
            เริ่มใช้ฟรี
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-badge">สำหรับร้านค้าออนไลน์ไทย</span>
            <h1>
              ยอดขายเยอะ
              <br />
              ไม่ได้แปลว่า <em>กำไรเยอะ</em>
            </h1>
            <p>
              เหลือจริงช่วยรวมต้นทุนจาก Shopee, TikTok Shop และ Lazada
              เพื่อบอกว่า หลังหักทุกอย่างแล้ว ร้านคุณเหลือกำไรจริงเท่าไร
            </p>

            <div className="hero-actions">
              <Link href="/register" className="button primary large">
                เริ่มใช้ฟรี
              </Link>
              <Link href="/login?demo=1" className="button secondary large">
                ทดลอง Demo
              </Link>
            </div>

            <div className="hero-trust">
              <span>✓ ไม่ต้องเชื่อม API ใน POC</span>
              <span>✓ เริ่มจาก CSV ได้</span>
              <span>✓ ดูต้นทุนถึงระดับ SKU</span>
            </div>
          </div>

          <div className="hero-product">
            <div className="hero-product-top">
              <span>ภาพรวมร้าน • เดือนนี้</span>
              <span className="mini-badge">LIVE DEMO</span>
            </div>

            <div className="hero-metrics">
              <div>
                <span>ยอดขาย</span>
                <strong>฿98,267</strong>
              </div>
              <div>
                <span>กำไรจริง</span>
                <strong className="good">฿23,481</strong>
              </div>
            </div>

            <div className="hero-chart">
              <div className="hero-bars">
                {[36, 57, 45, 68, 62, 82, 77, 94, 86, 100, 91, 108].map(
                  (height, index) => (
                    <span key={index} style={{ height: `${Math.min(height, 100)}%` }} />
                  ),
                )}
              </div>
              <div className="hero-profit-line">
                <i style={{ left: "6%", bottom: "22%" }} />
                <i style={{ left: "22%", bottom: "31%" }} />
                <i style={{ left: "39%", bottom: "27%" }} />
                <i style={{ left: "55%", bottom: "43%" }} />
                <i style={{ left: "72%", bottom: "38%" }} />
                <i style={{ left: "90%", bottom: "53%" }} />
              </div>
            </div>

            <div className="hero-insight">
              <span>⚡ Insight</span>
              <strong>TikTok Ads กินกำไร 18.4% ของยอดขายช่องทางนี้</strong>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-section-head">
            <span>ไม่ได้ทำ ERP อีกตัว</span>
            <h2>เราตอบคำถามเดียวให้ชัดที่สุด</h2>
            <p>“ขายแล้วเงินจริง ๆ เหลือเท่าไร และต้องแก้อะไรต่อ?”</p>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="landing-section landing-how">
          <div className="landing-section-head">
            <span>เริ่มง่ายก่อน</span>
            <h2>ไม่ต้องเปลี่ยนระบบร้านที่ใช้อยู่</h2>
          </div>

          <div className="how-grid">
            <div><b>1</b><strong>Import</strong><span>เอา CSV จาก Marketplace เข้ามา</span></div>
            <div><b>2</b><strong>Analyze</strong><span>เหลือจริงแยก Fee, Ads, Affiliate และสินค้า</span></div>
            <div><b>3</b><strong>Decide</strong><span>รู้ว่าควรลดอะไร เพิ่มราคาไหน หรือหยุดโปรไหน</span></div>
          </div>
        </section>

        <LandingTestimonials />

        <section className="landing-cta">
          <div>
            <span>POC เปิดให้ลองแล้ว</span>
            <h2>ลองเป็นเจ้าของร้าน Demo ก่อน</h2>
            <p>ไม่ต้องสมัครก็ได้ กด Demo แล้วเข้า Dashboard ได้ทันที</p>
          </div>
          <Link href="/login?demo=1" className="button primary large">
            เปิด Demo Account
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand">
          <BrandMark size={32} />
          <div>
            <strong>เหลือจริง</strong>
            <small>POC v0.7</small>
          </div>
        </div>
        <div>
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
}
