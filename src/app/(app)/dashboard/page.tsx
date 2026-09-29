"use client";

import Link from "next/link";
import { useSellerData } from "@/components/seller-data-provider";
import { MetricCard } from "@/components/metric-card";
import { ProductTable } from "@/components/product-table";
import { DailyTrendChart } from "@/components/daily-trend-chart";
import { PlatformCostChart } from "@/components/platform-cost-chart";
import { aggregateBy, money, percent, totals } from "@/lib/analytics";

export default function DashboardPage() {
  const { rows } = useSellerData();
  const summary = totals(rows);
  const channels = aggregateBy(rows, "channel").sort((a, b) => b.profit - a.profit);
  const products = aggregateBy(rows, "sku").sort((a, b) => b.profit - a.profit);
  const risky = [...products].sort((a, b) => a.margin - b.margin)[0];
  const best = products[0];

  return (
    <>
      <section className="metrics-grid">
        <MetricCard
          label="ยอดขาย"
          value={money(summary.revenue)}
          caption={`${summary.qty.toLocaleString("th-TH")} ชิ้น`}
        />
        <MetricCard
          label="กำไรจริง"
          value={money(summary.profit)}
          caption={`Margin ${percent(summary.margin)}`}
          accent="good"
        />
        <MetricCard
          label="Platform + Ads + Affiliate"
          value={money(summary.platformFees + summary.ads + summary.affiliate)}
          caption={`${percent((summary.platformFees + summary.ads + summary.affiliate) / summary.revenue)} ของยอดขาย`}
          accent="warn"
          action={<Link className="inline-action" href="/costs">เจาะดูต้นทุน →</Link>}
        />
        <MetricCard
          label="Discount + Refund"
          value={money(summary.discount + summary.refunds)}
          caption={`${percent((summary.discount + summary.refunds) / summary.revenue)} ของยอดขาย`}
        />
      </section>

      <section className="dashboard-chart-grid">
        <article className="card chart-card chart-card-wide">
          <div className="section-head">
            <div>
              <p className="eyebrow">DAILY TREND</p>
              <h2>ยอดขาย vs กำไรจริง</h2>
              <p className="muted">ดูแนวโน้มรายวันว่า “ขายเพิ่ม” แล้วกำไรเพิ่มตามหรือไม่</p>
            </div>
            <span className="tag good-tag">Daily</span>
          </div>
          <DailyTrendChart rows={rows} />
        </article>

        <article className="card chart-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">COST RATIO</p>
              <h2>ค่าใช้จ่ายต่อยอดขาย</h2>
              <p className="muted">เทียบแต่ละ Platform ว่าช่องทางไหนกินรายได้มากที่สุด</p>
            </div>
            <Link href="/costs" className="inline-action">ดูรายละเอียด →</Link>
          </div>
          <PlatformCostChart rows={rows} />
        </article>
      </section>

      <section className="split-grid section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">CHANNELS</p>
              <h2>กำไรแยกตามช่องทาง</h2>
            </div>
          </div>
          <div className="channel-list">
            {channels.map((channel) => (
              <div className="channel-line" key={channel.channel}>
                <div>
                  <strong>{channel.channel}</strong>
                  <span>{percent(channel.margin)} margin</span>
                </div>
                <div className="bar">
                  <span style={{ width: `${Math.max(5, channel.margin * 260)}%` }} />
                </div>
                <strong>{money(channel.profit)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">TODAY</p>
              <h2>สิ่งที่ควรทำวันนี้</h2>
            </div>
          </div>
          <div className="insight">
            <strong>เช็ก {risky?.sku}</strong>
            <span>Margin ต่ำสุดที่ {percent(risky?.margin ?? 0)}</span>
          </div>
          <div className="insight">
            <strong>ดัน {best?.sku}</strong>
            <span>ทำกำไรสูงสุด {money(best?.profit ?? 0)}</span>
          </div>
          <div className="insight">
            <strong>ดู Cost Breakdown</strong>
            <span>หาให้เจอว่า Ads, Affiliate หรือ Fee ตัวไหนกินกำไรมากที่สุด</span>
          </div>
        </article>
      </section>

      <section className="card section-space">
        <div className="section-head">
          <div>
            <p className="eyebrow">PRODUCTS</p>
            <h2>สินค้าเด่น / สินค้าเสี่ยง</h2>
          </div>
          <Link href="/products" className="button secondary">ดูทั้งหมด</Link>
        </div>
        <ProductTable rows={products.slice(0, 4)} />
      </section>
    </>
  );
}
