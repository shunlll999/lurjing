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
          <Link href="/cookies">คุกกี้</Link>
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
            <span className="hero-badge">Early Access • ฟรีช่วงรับ Feedback</span>
            <h1>
              ยอดขายเยอะ
              <br />
              ไม่ได้แปลว่า <em>กำไรเยอะ</em>
            </h1>
            <p>
              เหลือจริงช่วยรวมต้นทุนจาก Shopee, TikTok Shop และ Lazada
              เพื่อบอกว่า หลังหักทุกอย่างแล้ว ร้านคุณเหลือกำไรจริงเท่าไร
              ช่วง Early นี้เปิดให้ใช้งานฟรี เพื่อรับ Feedback จากผู้ใช้จริง
            </p>

            <div className="hero-actions">
              <Link href="/register" className="button primary large">
                เริ่มใช้ฟรี — ไม่มีค่าใช้จ่าย
              </Link>
              <Link href="/login?demo=1" className="button secondary large">
                ทดลอง Demo
              </Link>
            </div>

            <div className="hero-trust">
              <span>✓ ฟรีในช่วง Early ไม่มีค่าใช้จ่ายตอนนี้</span>
              <span>✓ เริ่มจาก CSV ได้</span>
              <span>✓ ดูต้นทุนถึงระดับ SKU</span>
            </div>
          </div>

          <div className="hero-product hero-product-v2">
            <div className="hero-product-top hero-store-head">
              <div className="hero-store-identity">
                <span className="hero-store-avatar">ป้าส่งยิ้ม</span>
                <div>
                  <strong>ร้านตัวอย่าง&nbsp;</strong>
                  <small>Shopee + TikTok Shop • 30 วันล่าสุด</small>
                </div>
              </div>
              <span className="hero-free-badge">EARLY • FREE</span>
            </div>

            <div className="hero-metrics hero-metrics-v2">
              <div>
                <span>ยอดขาย</span>
                <strong>฿98,267</strong>
                <small className="metric-trend up">↑ 12.8%</small>
              </div>
              <div className="hero-profit-metric">
                <span>กำไรจริง</span>
                <strong className="good">฿23,481</strong>
                <small className="metric-caption">หลังหักค่าใช้จ่ายทั้งหมด</small>
              </div>
              <div>
                <span>Margin</span>
                <strong>23.9%</strong>
                <small className="metric-trend up">↑ 2.4 pts</small>
              </div>
            </div>

            <div className="hero-chart hero-chart-v2">
              <div className="hero-chart-head">
                <div>
                  <strong>ยอดขาย vs กำไรจริง</strong>
                  <span>12 วันล่าสุด</span>
                </div>
                <div className="hero-chart-legend">
                  <span><i className="legend-sales" />ยอดขาย</span>
                  <span><i className="legend-profit" />กำไรจริง</span>
                </div>
              </div>

              <div className="hero-chart-stage">
                <div className="hero-bars hero-bars-v2">
                  {[44, 59, 52, 68, 63, 78, 72, 88, 81, 95, 86, 100].map(
                    (height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ),
                  )}
                </div>

                <svg
                  className="hero-profit-svg"
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#27A56E" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#27A56E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 170 C100 158 120 164 190 145 S290 150 360 120 S465 128 535 92 S650 105 715 74 S825 87 900 54 S955 60 980 44 L980 220 L20 220 Z"
                    fill="url(#profitArea)"
                  />
                  <path
                    d="M20 170 C100 158 120 164 190 145 S290 150 360 120 S465 128 535 92 S650 105 715 74 S825 87 900 54 S955 60 980 44"
                    fill="none"
                    stroke="#27A56E"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {[
                    [20, 170], [190, 145], [360, 120], [535, 92],
                    [715, 74], [900, 54], [980, 44],
                  ].map(([cx, cy], index) => (
                    <circle key={index} cx={cx} cy={cy} r="6" fill="#FFFFFF" stroke="#27A56E" strokeWidth="4" />
                  ))}
                </svg>
              </div>

              <div className="hero-chart-labels">
                <span>01</span><span>04</span><span>07</span><span>10</span><span>12</span>
              </div>
            </div>

            <div className="hero-insight hero-insight-v2">
              <span className="hero-insight-icon">⚡</span>
              <div>
                <span>PROFIT INSIGHT</span>
                <strong>Ads เป็นค่าใช้จ่ายที่กินกำไรมากที่สุด 18.4%</strong>
                <small>เริ่มจากเช็ก Campaign ที่ใช้เงินสูงแต่สร้างกำไรต่ำ</small>
              </div>
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
            <span>Early Access • ฟรีช่วงรับ Feedback</span>
            <h2>ลองใช้เหลือจริงฟรี แล้วช่วยเราทำให้ตรงกับร้านคุณมากขึ้น</h2>
            <p>ตอนนี้ไม่มีค่าใช้จ่าย เริ่มจาก Demo หรือสมัครบัญชีฟรีเพื่อใช้ข้อมูลร้านของคุณเอง</p>
          </div>
          <Link href="/login?demo=1" className="button primary large">
            ลอง Demo ฟรี
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-brand">
          <BrandMark size={32} />
          <div>
            <strong>เหลือจริง</strong>
            <small>Early v0.7</small>
          </div>
        </div>
        <div>
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
}
