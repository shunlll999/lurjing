import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/brand-logo";

export default function TermsPage() {
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
        <Link href="/register" className="button primary">เริ่มใช้ฟรี</Link>
      </header>

      <main className="legal-content">
        <Image src="/assets/images/lurjinw.png" alt="LurJing" className="logo-lurjing" width={100} height={100} />
        <div className="legal-head">
          <p className="eyebrow">TERMS & CONDITIONS</p>
          <h1>ข้อตกลงและเงื่อนไขการใช้งาน</h1>
          <p>
            อัปเดตสำหรับ POC: 29 กันยายน 2569
          </p>
        </div>

        <div className="legal-note">
          เอกสารนี้เป็นฉบับสำหรับ POC เพื่อทดสอบผลิตภัณฑ์ ไม่ใช่เอกสารกฎหมายฉบับพร้อมใช้งานเชิงพาณิชย์
          ก่อนเปิดบริการจริงควรให้ผู้เชี่ยวชาญด้านกฎหมายตรวจสอบอีกครั้ง
        </div>

        <section>
          <h2>1. ขอบเขตบริการ</h2>
          <p>
            เหลือจริงเป็นเครื่องมือช่วยรวบรวมและวิเคราะห์ข้อมูลยอดขาย ต้นทุน ค่าธรรมเนียม
            ค่าโฆษณา Affiliate ส่วนลด และข้อมูลอื่นที่ผู้ใช้นำเข้ามา เพื่อแสดงประมาณการกำไรและข้อมูลประกอบการตัดสินใจ
          </p>
        </section>

        <section>
          <h2>2. บัญชีผู้ใช้งาน</h2>
          <p>
            ผู้ใช้มีหน้าที่รักษาความถูกต้องของข้อมูลบัญชีและไม่ควรใช้รหัสผ่านเดียวกับบริการสำคัญอื่น
            สำหรับ POC นี้ บัญชีที่สมัครและ session ถูกเก็บใน browser ของอุปกรณ์ที่ใช้งาน
          </p>
        </section>

        <section>
          <h2>3. ข้อมูลที่ผู้ใช้นำเข้า</h2>
          <p>
            ผู้ใช้ควรนำเข้าข้อมูลที่ตนมีสิทธิใช้งานเท่านั้น และควรตรวจสอบข้อมูลส่วนบุคคลหรือข้อมูลลูกค้าที่ไม่จำเป็นก่อนอัปโหลด
            เวอร์ชัน POC ประมวลผลข้อมูลบนอุปกรณ์เป็นหลักและไม่ได้ออกแบบมาเป็นระบบจัดเก็บข้อมูลธุรกิจระยะยาว
          </p>
        </section>

        <section>
          <h2>4. ความถูกต้องของผลคำนวณ</h2>
          <p>
            ผลวิเคราะห์เป็นข้อมูลประกอบการตัดสินใจและอาจคลาดเคลื่อนได้จากโครงสร้างค่าธรรมเนียม โปรโมชัน ภาษี
            การคืนสินค้า หรือข้อมูลต้นทาง ผู้ใช้ควรตรวจสอบกับรายงานของ Marketplace และข้อมูลบัญชีจริงก่อนตัดสินใจทางการเงิน
          </p>
        </section>

        <section>
          <h2>5. Demo Account</h2>
          <p>
            บัญชี Demo มีไว้เพื่อสาธิตการทำงานและใช้ข้อมูลตัวอย่าง ไม่ควรนำข้อมูลสำคัญ ข้อมูลส่วนบุคคล
            หรือข้อมูลธุรกิจที่เป็นความลับมาใส่ใน Demo Account
          </p>
        </section>

        <section>
          <h2>6. การเปลี่ยนแปลงบริการ</h2>
          <p>
            เนื่องจากเป็น POC ฟีเจอร์ โครงสร้างข้อมูล และหน้าตาอาจเปลี่ยนได้ระหว่างการทดลอง
            โดยข้อมูลภายใน browser อาจถูกรีเซ็ตระหว่างเวอร์ชัน
          </p>
        </section>

        <section>
          <h2>7. การยอมรับข้อตกลง</h2>
          <p>
            เมื่อสร้างบัญชีหรือใช้งาน POC ต่อ ผู้ใช้ถือว่ายอมรับเงื่อนไขฉบับนี้ในขอบเขตของการทดลองผลิตภัณฑ์
          </p>
        </section>

        <div className="legal-actions">
          <Link href="/register" className="button primary">กลับไปสมัครบัญชี</Link>
          <Link href="/" className="button secondary">กลับหน้าแรก</Link>
        </div>
      </main>
    </div>
  );
}
