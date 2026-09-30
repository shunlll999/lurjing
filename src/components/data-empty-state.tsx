"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

export function DataEmptyState({
  title = "ยังไม่มีข้อมูลร้านของคุณ",
  description = "บัญชีจริงจะไม่ใช้ข้อมูล Demo เริ่มต้นจากศูนย์ แล้วนำเข้าข้อมูลร้านของคุณเมื่อพร้อม",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="card data-empty-state">
      <div className="data-empty-visual">
        <BrandMark logoPath="/assets/images/lutjingS.png" size={100} />
        <span className="data-empty-spark spark-one" />
        <span className="data-empty-spark spark-two" />
      </div>

      <div className="data-empty-copy">
        <p className="eyebrow">
          YOUR REAL DATA
        </p>

        <h2>{title}</h2>

        <p>
          {description}
        </p>

        <div className="data-empty-actions">
          <Link
            href="/import"
            className="button primary"
          >
            นำเข้าข้อมูลร้าน
          </Link>

          <Link
            href="/simulator"
            className="button secondary"
          >
            ทดลอง Promotion Simulator
          </Link>
        </div>

        <small>
          Demo account เท่านั้นที่แสดงข้อมูลตัวอย่างอัตโนมัติ
        </small>
      </div>
    </section>
  );
}
