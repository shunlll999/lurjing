import { money, percent } from "@/lib/analytics";
import type { AnalyticsRow } from "@/types/seller";

export function ProductTable({ rows }: { rows: AnalyticsRow[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>SKU / Product</th>
            <th>ยอดขาย</th>
            <th>ค่าใช้จ่าย</th>
            <th>กำไร</th>
            <th>Margin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sku}>
              <td>
                <strong>{row.sku}</strong>
                <span className="cell-note">{row.product}</span>
              </td>
              <td>{money(row.revenue)}</td>
              <td>{money(row.totalCost)}</td>
              <td className={row.profit < 0 ? "bad" : "good"}>{money(row.profit)}</td>
              <td>
                <span className={`tag ${row.margin < 0.08 ? "bad-tag" : row.margin < 0.15 ? "warn-tag" : "good-tag"}`}>
                  {percent(row.margin)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
