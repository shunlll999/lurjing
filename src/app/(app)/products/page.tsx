"use client";

import { useSellerData } from "@/components/seller-data-provider";
import { DataEmptyState } from "@/components/data-empty-state";
import { ProductTable } from "@/components/product-table";
import { aggregateBy } from "@/lib/analytics";

export default function ProductsPage() {
  const { rows, ready } = useSellerData();
  if (!ready) {
    return (
      <section className="card data-loading-state">
        <div className="auth-loading-dot" />
        <span>กำลังเตรียมข้อมูลร้าน...</span>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <DataEmptyState
        title="ยังไม่มีข้อมูลสินค้า"
        description="เมื่อมีข้อมูลที่นำเข้า ระบบจะแสดงกำไรจริงและ Margin แยกตาม SKU ของร้านคุณตรงนี้"
      />
    );
  }

  const products = aggregateBy(rows, "sku").sort((a, b) => b.profit - a.profit);

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">PRODUCT PROFITABILITY</p>
          <h2>กำไรจริงรายสินค้า</h2>
          <p className="muted">เรียงตามกำไรสุทธิหลังหักค่าใช้จ่ายทั้งหมด</p>
        </div>
      </div>
      <ProductTable rows={products} />
    </section>
  );
}
