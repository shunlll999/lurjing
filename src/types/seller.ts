export type Channel = "TikTok Shop" | "Shopee" | "Lazada" | string;

export interface SellerRow {
  date: string;
  channel: Channel;
  sku: string;
  product: string;
  qty: number;
  revenue: number;
  cogs: number;
  commission: number;
  payment_fee: number;
  service_fee: number;
  affiliate: number;
  ads: number;
  discount: number;
  refunds: number;
}

export type FeeKey =
  | "commission"
  | "payment_fee"
  | "service_fee"
  | "affiliate"
  | "ads"
  | "discount"
  | "refunds";

export interface AnalyticsRow extends SellerRow {
  totalCost: number;
  profit: number;
  margin: number;
}
