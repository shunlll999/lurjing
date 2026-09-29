import type { AnalyticsRow, FeeKey, SellerRow } from "@/types/seller";

export const feeKeys: FeeKey[] = [
  "commission",
  "payment_fee",
  "service_fee",
  "affiliate",
  "ads",
  "discount",
  "refunds",
];

export const feeLabels: Record<FeeKey, string> = {
  commission: "Commission",
  payment_fee: "Payment Fee",
  service_fee: "Service Fee",
  affiliate: "Affiliate",
  ads: "Ads",
  discount: "Seller Discount",
  refunds: "Refund / Return",
};

export function rowProfit(row: SellerRow) {
  return row.revenue - row.cogs - feeKeys.reduce((sum, key) => sum + row[key], 0);
}

export function totals(rows: SellerRow[]) {
  const sum = (key: keyof SellerRow) =>
    rows.reduce((total, row) => total + (typeof row[key] === "number" ? Number(row[key]) : 0), 0);

  const revenue = sum("revenue");
  const cogs = sum("cogs");
  const qty = sum("qty");

  const fees = Object.fromEntries(
    feeKeys.map((key) => [key, sum(key)])
  ) as Record<FeeKey, number>;

  const platformFees = fees.commission + fees.payment_fee + fees.service_fee;
  const nonCogsCost = feeKeys.reduce((total, key) => total + fees[key], 0);
  const profit = revenue - cogs - nonCogsCost;

  return {
    revenue,
    cogs,
    qty,
    ...fees,
    platformFees,
    nonCogsCost,
    profit,
    margin: revenue ? profit / revenue : 0,
  };
}

export function aggregateBy(rows: SellerRow[], key: "channel" | "sku") {
  const map = new Map<string, SellerRow>();

  for (const row of rows) {
    const id = row[key];
    const current = map.get(id);

    if (!current) {
      map.set(id, { ...row });
      continue;
    }

    map.set(id, {
      ...current,
      qty: current.qty + row.qty,
      revenue: current.revenue + row.revenue,
      cogs: current.cogs + row.cogs,
      commission: current.commission + row.commission,
      payment_fee: current.payment_fee + row.payment_fee,
      service_fee: current.service_fee + row.service_fee,
      affiliate: current.affiliate + row.affiliate,
      ads: current.ads + row.ads,
      discount: current.discount + row.discount,
      refunds: current.refunds + row.refunds,
    });
  }

  return [...map.values()].map<AnalyticsRow>((row) => {
    const totalCost = feeKeys.reduce((sum, fee) => sum + row[fee], 0);
    const profit = row.revenue - row.cogs - totalCost;

    return {
      ...row,
      totalCost,
      profit,
      margin: row.revenue ? profit / row.revenue : 0,
    };
  });
}

export const money = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

export const percent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;
