"use client";

import { aggregateBy, money, percent } from "@/lib/analytics";
import type { SellerRow } from "@/types/seller";

export function PlatformCostOverviewChart({ rows }: { rows: SellerRow[] }) {
  const channels = aggregateBy(rows, "channel")
    .map((channel) => {
      const platformFees =
        channel.commission + channel.payment_fee + channel.service_fee;
      const promotions = channel.discount + channel.refunds;
      const cost = platformFees + channel.ads + channel.affiliate + promotions;

      return {
        ...channel,
        platformFees,
        promotions,
        cost,
        costRate: channel.revenue ? cost / channel.revenue : 0,
      };
    })
    .sort((a, b) => b.costRate - a.costRate);

  const maxRate = Math.max(...channels.map((item) => item.costRate), 0.01);

  return (
    <div className="platform-overview-chart">
      <div className="cost-legend">
        <span><i className="cost-swatch fee-swatch" />Platform fee</span>
        <span><i className="cost-swatch ads-swatch" />Ads</span>
        <span><i className="cost-swatch affiliate-swatch" />Affiliate</span>
        <span><i className="cost-swatch promo-swatch" />Discount + Refund</span>
      </div>

      <div className="platform-overview-list">
        {channels.map((channel) => {
          const scale = 100 / maxRate;

          return (
            <div className="platform-overview-row" key={channel.channel}>
              <div className="platform-overview-head">
                <div>
                  <strong>{channel.channel}</strong>
                  <span>
                    ค่าใช้จ่าย {money(channel.cost)} จากยอดขาย {money(channel.revenue)}
                  </span>
                </div>
                <div className="platform-overview-rate">
                  <strong>{percent(channel.costRate)}</strong>
                  <span>ของยอดขาย</span>
                </div>
              </div>

              <div className="platform-overview-track">
                <span
                  className="fee-segment"
                  style={{
                    width: `${Math.min(
                      100,
                      (channel.platformFees / channel.revenue) * scale,
                    )}%`,
                  }}
                  title={`Platform fee ${money(channel.platformFees)}`}
                />
                <span
                  className="ads-segment"
                  style={{
                    width: `${Math.min(
                      100,
                      (channel.ads / channel.revenue) * scale,
                    )}%`,
                  }}
                  title={`Ads ${money(channel.ads)}`}
                />
                <span
                  className="affiliate-segment"
                  style={{
                    width: `${Math.min(
                      100,
                      (channel.affiliate / channel.revenue) * scale,
                    )}%`,
                  }}
                  title={`Affiliate ${money(channel.affiliate)}`}
                />
                <span
                  className="promo-segment"
                  style={{
                    width: `${Math.min(
                      100,
                      (channel.promotions / channel.revenue) * scale,
                    )}%`,
                  }}
                  title={`Discount + Refund ${money(channel.promotions)}`}
                />
              </div>

              <div className="platform-overview-foot">
                <span>0%</span>
                <span>
                  เทียบกับช่องทางที่มี Cost Ratio สูงสุด {percent(maxRate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
