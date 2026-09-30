"use client";

import { useMemo, useState } from "react";
import { useSellerData } from "@/components/seller-data-provider";
import { DataEmptyState } from "@/components/data-empty-state";
import { PlatformCostOverviewChart } from "@/components/platform-cost-overview-chart";
import { FeeBreakdownChart } from "@/components/fee-breakdown-chart";
import { aggregateBy, feeKeys, feeLabels, money, percent, totals } from "@/lib/analytics";

export default function CostsPage() {
  const { rows, ready } = useSellerData();

  const platforms = useMemo(
    () => ["ทุกช่องทาง", ...Array.from(new Set(rows.map((row) => row.channel)))],
    [rows],
  );

  const [selected, setSelected] = useState("ทุกช่องทาง");

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
        title="ยังไม่มีข้อมูลต้นทุน Platform"
        description="นำเข้าข้อมูลร้านก่อน แล้ว LurJing จะคำนวณ Fee, Ads, Affiliate และกำไรจริงจากข้อมูลของคุณ"
      />
    );
  }

  const filtered =
    selected === "ทุกช่องทาง"
      ? rows
      : rows.filter((row) => row.channel === selected);

  const summary = totals(filtered);
  const skuRows = aggregateBy(filtered, "sku").sort(
    (a, b) => b.totalCost - a.totalCost,
  );
  const topFee = [...feeKeys].sort(
    (a, b) => summary[b] - summary[a],
  )[0];

  return (
    <>
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">PLATFORM COST OVERVIEW</p>
            <h2>ต้นทุน Platform เทียบกัน</h2>
            <p className="muted">
              ดูว่าแต่ละช่องทางกินรายได้ไปกี่เปอร์เซ็นต์ และเงินไปอยู่ที่ Fee, Ads,
              Affiliate หรือ Promotion
            </p>
          </div>
        </div>

        <PlatformCostOverviewChart rows={rows} />
      </section>

      <section className="card section-space">
        <div className="section-head">
          <div>
            <p className="eyebrow">DRILL-DOWN</p>
            <h2>เจาะต้นทุนราย Platform</h2>
            <p className="muted">
              เลือก TikTok Shop, Shopee หรือ Lazada เพื่อดูรายละเอียด
            </p>
          </div>
        </div>

        <div className="tabs">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelected(platform)}
              className={platform === selected ? "tab active" : "tab"}
            >
              {platform}
            </button>
          ))}
        </div>

        <div className="cost-summary-grid">
          <div className="cost-tile">
            <span>ยอดขาย</span>
            <strong>{money(summary.revenue)}</strong>
          </div>

          <div className="cost-tile">
            <span>Platform fees</span>
            <strong>{money(summary.platformFees)}</strong>
            <small>{percent(summary.platformFees / Math.max(summary.revenue, 1))}</small>
          </div>

          <div className="cost-tile">
            <span>Ads</span>
            <strong>{money(summary.ads)}</strong>
            <small>{percent(summary.ads / Math.max(summary.revenue, 1))}</small>
          </div>

          <div className="cost-tile">
            <span>Affiliate</span>
            <strong>{money(summary.affiliate)}</strong>
            <small>{percent(summary.affiliate / Math.max(summary.revenue, 1))}</small>
          </div>

          <div className="cost-tile">
            <span>Discount + Refund</span>
            <strong>{money(summary.discount + summary.refunds)}</strong>
          </div>

          <div className="cost-tile featured">
            <span>กำไรจริง</span>
            <strong>{money(summary.profit)}</strong>
            <small>Margin {percent(summary.margin)}</small>
          </div>
        </div>
      </section>

      <section className="split-grid section-space">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">FEE MIX</p>
              <h2>ค่าใช้จ่ายของ {selected}</h2>
              <p className="muted">
                ยิ่งแท่งยาว แปลว่าค่าใช้จ่ายประเภทนั้นกินเงินมาก
              </p>
            </div>
          </div>

          <FeeBreakdownChart rows={filtered} />
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">INSIGHT</p>
              <h2>อะไรน่าจับตา</h2>
            </div>
          </div>

          <div className="insight">
            <strong>{feeLabels[topFee]} สูงที่สุด</strong>
            <span>
              {money(summary[topFee])} หรือ{" "}
              {percent(summary[topFee] / Math.max(summary.revenue, 1))} ของยอดขาย
            </span>
          </div>

          <div className="insight">
            <strong>ค่าใช้จ่ายนอก COGS</strong>
            <span>
              {money(summary.nonCogsCost)} หรือ{" "}
              {percent(summary.nonCogsCost / Math.max(summary.revenue, 1))} ของยอดขาย
            </span>
          </div>

          <div className="insight">
            <strong>หลังหักทุกอย่าง</strong>
            <span>
              เหลือกำไร {money(summary.profit)} • Margin {percent(summary.margin)}
            </span>
          </div>
        </article>
      </section>

      <section className="card section-space">
        <div className="section-head">
          <div>
            <p className="eyebrow">SKU COST</p>
            <h2>SKU ไหนแบกค่าใช้จ่าย</h2>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Revenue</th>
                <th>Commission</th>
                <th>Affiliate</th>
                <th>Ads</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {skuRows.map((row) => (
                <tr key={row.sku}>
                  <td>
                    <strong>{row.sku}</strong>
                    <span className="cell-note">{row.product}</span>
                  </td>
                  <td>{money(row.revenue)}</td>
                  <td>{money(row.commission)}</td>
                  <td>{money(row.affiliate)}</td>
                  <td>{money(row.ads)}</td>
                  <td className={row.profit < 0 ? "bad" : "good"}>
                    {money(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
