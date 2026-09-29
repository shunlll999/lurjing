"use client";

import { feeKeys, feeLabels, money, percent, totals } from "@/lib/analytics";
import type { SellerRow } from "@/types/seller";

export function FeeBreakdownChart({ rows }: { rows: SellerRow[] }) {
  const summary = totals(rows);
  const values = feeKeys
    .map((key) => ({
      key,
      label: feeLabels[key],
      value: summary[key],
      rate: summary.revenue ? summary[key] / summary.revenue : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="fee-breakdown-chart">
      {values.map((item) => (
        <div className="fee-breakdown-row" key={item.key}>
          <div className="fee-breakdown-label">
            <div>
              <strong>{item.label}</strong>
              <span>{percent(item.rate)} ของยอดขาย</span>
            </div>
            <strong>{money(item.value)}</strong>
          </div>

          <div className="fee-breakdown-track">
            <span style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
