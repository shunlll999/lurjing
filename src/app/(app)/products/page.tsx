"use client";

import { useSellerData } from "@/components/seller-data-provider";
import { ProductTable } from "@/components/product-table";
import { aggregateBy } from "@/lib/analytics";

export default function ProductsPage() {
  const { rows } = useSellerData();
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
