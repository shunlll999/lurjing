import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  caption,
  accent,
  action,
}: {
  label: string;
  value: string;
  caption: string;
  accent?: "good" | "warn" | "bad";
  action?: ReactNode;
}) {
  return (
    <article className="card metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${accent ?? ""}`}>{value}</div>
      <div className="metric-caption">{caption}</div>
      {action}
    </article>
  );
}
