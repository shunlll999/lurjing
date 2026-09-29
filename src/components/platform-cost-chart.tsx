"use client";

import { aggregateBy, money, percent } from "@/lib/analytics";
import type { SellerRow } from "@/types/seller";

export function PlatformCostChart({ rows }: { rows: SellerRow[] }) {
  const channels = aggregateBy(rows, "channel")
    .map((channel) => {
      const platformFees = channel.commission + channel.payment_fee + channel.service_fee;
      const promoCost = channel.discount + channel.refunds;
      const total = platformFees + channel.ads + channel.affiliate + promoCost;

      return {
        ...channel,
        platformFees,
        promoCost,
        total,
        totalRate: channel.revenue ? total / channel.revenue : 0,
      };
    })
    .sort((a, b) => b.totalRate - a.totalRate);

  return (
    <div className="platform-cost-chart">
      <div className="cost-legend">
        <span><i className="cost-swatch fee-swatch" />Platform fee</span>
        <span><i className="cost-swatch ads-swatch" />Ads</span>
        <span><i className="cost-swatch affiliate-swatch" />Affiliate</span>
        <span><i className="cost-swatch promo-swatch" />Discount + Refund</span>
      </div>

      <div className="platform-bars">
        {channels.map((channel) => {
          const segments = [
            { key: "fee", value: channel.platformFees, className: "fee-segment" },
            { key: "ads", value: channel.ads, className: "ads-segment" },
            { key: "affiliate", value: channel.affiliate, className: "affiliate-segment" },
            { key: "promo", value: channel.promoCost, className: "promo-segment" },
          ];

          return (
            <div className="platform-bar-row" key={channel.channel}>
              <div className="platform-bar-head">
                <div>
                  <strong>{channel.channel}</strong>
                  <span>{money(channel.total)} ค่าใช้จ่ายรวม</span>
                </div>
                <strong className={channel.totalRate > 0.32 ? "bad" : channel.totalRate > 0.25 ? "warn" : "good"}>
                  {percent(channel.totalRate)}
                </strong>
              </div>

              <div className="stacked-cost-bar" title={`ต้นทุนรวม ${percent(channel.totalRate)} ของยอดขาย`}>
                {segments.map((segment) => (
                  <span
                    key={segment.key}
                    className={segment.className}
                    style={{
                      width: `${channel.revenue ? (segment.value / channel.revenue) * 100 : 0}%`,
                    }}
                  >
                    <span className="sr-only">
                      {segment.key}: {money(segment.value)}
                    </span>
                  </span>
                ))}
              </div>

              <div className="platform-bar-foot">
                <span>0%</span>
                <span>25%</span>
                <span>50% ของยอดขาย</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
