import type { SellerRow } from "@/types/seller";

const requiredColumns = [
  "date",
  "channel",
  "sku",
  "product",
  "qty",
  "revenue",
  "cogs",
  "commission",
  "payment_fee",
  "service_fee",
  "affiliate",
  "ads",
  "discount",
  "refunds",
] as const;

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

export function parseSellerCsv(text: string): SellerRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("ไม่พบข้อมูลในไฟล์");

  const headers = splitCsvLine(lines[0].replace(/^\uFEFF/, "")).map((value) => value.trim());

  if (!requiredColumns.every((column) => headers.includes(column))) {
    throw new Error("CSV schema ไม่ครบ");
  }

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""]));

    return {
      date: raw.date,
      channel: raw.channel,
      sku: raw.sku,
      product: raw.product,
      qty: Number(raw.qty) || 0,
      revenue: Number(raw.revenue) || 0,
      cogs: Number(raw.cogs) || 0,
      commission: Number(raw.commission) || 0,
      payment_fee: Number(raw.payment_fee) || 0,
      service_fee: Number(raw.service_fee) || 0,
      affiliate: Number(raw.affiliate) || 0,
      ads: Number(raw.ads) || 0,
      discount: Number(raw.discount) || 0,
      refunds: Number(raw.refunds) || 0,
    };
  }).filter((row) => row.sku && row.channel);
}
