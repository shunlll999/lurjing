"use client";

import { money } from "@/lib/analytics";
import type { SellerRow } from "@/types/seller";

interface Point {
  date: string;
  revenue: number;
  profit: number;
}

const feeKeys = [
  "commission",
  "payment_fee",
  "service_fee",
  "affiliate",
  "ads",
  "discount",
  "refunds",
] as const;

function buildDailyPoints(rows: SellerRow[]): Point[] {
  const map = new Map<string, Point>();

  for (const row of rows) {
    const fees = feeKeys.reduce((sum, key) => sum + row[key], 0);
    const profit = row.revenue - row.cogs - fees;
    const current = map.get(row.date) ?? { date: row.date, revenue: 0, profit: 0 };

    map.set(row.date, {
      date: row.date,
      revenue: current.revenue + row.revenue,
      profit: current.profit + profit,
    });
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function linePath(
  points: Point[],
  accessor: (point: Point) => number,
  width: number,
  height: number,
  maxValue: number,
) {
  if (!points.length) return "";

  const left = 52;
  const right = 16;
  const top = 18;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  return points
    .map((point, index) => {
      const x = left + (index / Math.max(points.length - 1, 1)) * chartWidth;
      const y = top + chartHeight - (accessor(point) / maxValue) * chartHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function DailyTrendChart({ rows }: { rows: SellerRow[] }) {
  const points = buildDailyPoints(rows);

  if (!points.length) {
    return <div className="chart-empty">ยังไม่มีข้อมูลสำหรับสร้างกราฟ</div>;
  }

  const width = 720;
  const height = 290;
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.revenue, Math.max(point.profit, 0)]),
    1,
  );

  const revenuePath = linePath(points, (point) => point.revenue, width, height, maxValue);
  const profitPath = linePath(points, (point) => Math.max(point.profit, 0), width, height, maxValue);

  const left = 52;
  const right = 16;
  const top = 18;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const gridValues = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div>
      <div className="chart-legend">
        <span><i className="legend-line revenue-line" />ยอดขาย</span>
        <span><i className="legend-line profit-line" />กำไรจริง</span>
      </div>

      <div className="chart-scroll">
        <svg
          className="trend-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="กราฟยอดขายและกำไรรายวัน"
        >
          {gridValues.map((ratio) => {
            const y = top + chartHeight * (1 - ratio);
            const value = maxValue * ratio;

            return (
              <g key={ratio}>
                <line
                  className="chart-grid-line"
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                />
                <text className="chart-axis-text" x={left - 8} y={y + 4} textAnchor="end">
                  {value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : Math.round(value)}
                </text>
              </g>
            );
          })}

          <path className="trend-line revenue-path" d={revenuePath} />
          <path className="trend-line profit-path" d={profitPath} />

          {points.map((point, index) => {
            const x = left + (index / Math.max(points.length - 1, 1)) * chartWidth;
            const revenueY = top + chartHeight - (point.revenue / maxValue) * chartHeight;
            const profitY = top + chartHeight - (Math.max(point.profit, 0) / maxValue) * chartHeight;

            return (
              <g key={point.date}>
                <circle className="chart-point revenue-point" cx={x} cy={revenueY} r="4">
                  <title>{`${shortDate(point.date)} • ยอดขาย ${money(point.revenue)}`}</title>
                </circle>
                <circle className="chart-point profit-point" cx={x} cy={profitY} r="4">
                  <title>{`${shortDate(point.date)} • กำไร ${money(point.profit)}`}</title>
                </circle>
                <text className="chart-axis-text chart-x-label" x={x} y={height - 14} textAnchor="middle">
                  {shortDate(point.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
