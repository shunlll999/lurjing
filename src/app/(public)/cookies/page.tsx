import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

export const metadata = {
  title: "นโยบายคุกกี้",
  description: "นโยบายการใช้คุกกี้และ Analytics ของเหลือจริง",
};

export default function CookiesPage() {
  return (
    <div className="legal-page">
      <header className="legal-nav">
        <Link href="/" className="landing-brand">
          <BrandMark size={80} />
          <div>
            <strong>เหลือจริง</strong>
            <small>Seller Profit</small>
          </div>
        </Link>
        <Link href="/" className="button secondary">กลับหน้าแรก</Link>
      </header>

      <main className="legal-content">
        <div className="legal-head">
          <p className="eyebrow">COOKIE POLICY</p>
          <h1>นโยบายคุกกี้</h1>
          <p>อัปเดต: 3 ตุลาคม 2569</p>
        </div>

        <div className="legal-note">
          เหลือจริงให้ผู้ใช้เลือก Analytics ได้เอง และจะไม่เริ่ม Analytics ก่อนมีการยินยอม
          การตั้งค่าสามารถเปลี่ยนภายหลังได้จากปุ่ม “คุกกี้” ที่มุมหน้าจอ
        </div>

        <section>
          <h2>1. คุกกี้และพื้นที่จัดเก็บที่จำเป็น</h2>
          <p>
            เว็บไซต์อาจใช้คุกกี้หรือพื้นที่จัดเก็บของ browser ที่จำเป็นต่อการเข้าสู่ระบบ ความปลอดภัย
            การรักษา session และการทำงานพื้นฐานของบริการ ส่วนนี้ไม่สามารถปิดผ่านหน้าตั้งค่าคุกกี้ได้
            เพราะการปิดอาจทำให้บริการทำงานไม่ครบถ้วน
          </p>
        </section>

        <section>
          <h2>2. Analytics</h2>
          <p>
            เมื่อผู้ใช้เลือก “ยอมรับทั้งหมด” หรือเปิด Analytics ในหน้าตั้งค่า เหลือจริงอาจใช้ Google Analytics
            และ event analytics ภายในระบบเพื่อวัดการใช้งาน เช่น การเปิดหน้า การกดปุ่ม และการใช้ฟีเจอร์
            โดยไม่ตั้งใจส่งอีเมล ชื่อร้าน หรือข้อความที่ผู้ใช้กรอกเป็น event parameter ไปยัง Google Analytics
          </p>
        </section>

        <section>
          <h2>3. หากไม่ยินยอม Analytics</h2>
          <p>
            ผู้ใช้ยังสามารถใช้งานฟีเจอร์หลักของเหลือจริงได้ตามปกติ แต่ระบบจะไม่เริ่ม Google Analytics
            และจะไม่บันทึก event analytics ที่ใช้เพื่อวิเคราะห์พฤติกรรมการใช้งานของผู้ใช้
          </p>
        </section>

        <section>
          <h2>4. ระยะเวลาจัดเก็บการตั้งค่า</h2>
          <p>
            การเลือกคุกกี้ของผู้ใช้ถูกบันทึกไว้ในคุกกี้ของเว็บไซต์เป็นเวลาสูงสุด 180 วัน
            เพื่อไม่ต้องถามซ้ำทุกครั้งที่เปิดเว็บไซต์ ผู้ใช้สามารถเปลี่ยนการตั้งค่าได้ตลอดเวลาจากปุ่ม “คุกกี้”
          </p>
        </section>

        <section>
          <h2>5. การเปลี่ยนแปลงนโยบาย</h2>
          <p>
            นโยบายนี้อาจได้รับการปรับปรุงเมื่อมีการเปลี่ยนบริการ ผู้ให้บริการ Analytics หรือข้อกำหนดที่เกี่ยวข้อง
            เวอร์ชัน Early ควรได้รับการตรวจทานด้านกฎหมายอีกครั้งก่อนเปิดบริการเชิงพาณิชย์เต็มรูปแบบ
          </p>
        </section>

        <div className="legal-actions">
          <Link href="/" className="button primary">กลับหน้าแรก</Link>
          <Link href="/terms" className="button secondary">Terms & Conditions</Link>
        </div>
      </main>
    </div>
  );
}
