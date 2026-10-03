import {
  aggregateBy,
  feeKeys,
  money,
  percent,
  totals,
} from "@/lib/analytics";
import type { FeeKey, SellerRow } from "@/types/seller";

export type AiOwnerQuestionType =
  | "profit_summary"
  | "profit_leak"
  | "risk_sku"
  | "best_sku"
  | "next_action";

export type AiOwnerTone =
  | "good"
  | "warning"
  | "critical"
  | "neutral";

export interface AiOwnerEvidence {
  label: string;
  value: string;
  detail?: string;
}

export interface AiOwnerInsight {
  type: AiOwnerQuestionType;
  question: string;
  eyebrow: string;
  title: string;
  summary: string;
  tone: AiOwnerTone;
  evidence: AiOwnerEvidence[];
  actionTitle: string;
  action: string;
  dataNote: string;
}

export interface AiOwnerQuestion {
  type: AiOwnerQuestionType;
  label: string;
  shortLabel: string;
  description: string;
}

export const AI_OWNER_QUESTIONS: AiOwnerQuestion[] = [
  {
    type: "profit_summary",
    label: "เดือนนี้เหลือจริงเท่าไร?",
    shortLabel: "กำไรจริง",
    description: "สรุปยอดขาย กำไรจริง และ Margin จากข้อมูลล่าสุด",
  },
  {
    type: "profit_leak",
    label: "เงินรั่วตรงไหนมากที่สุด?",
    shortLabel: "เงินรั่ว",
    description: "หาค่าใช้จ่ายนอกต้นทุนสินค้าที่กินยอดขายมากที่สุด",
  },
  {
    type: "risk_sku",
    label: "สินค้าไหนเสี่ยงขาดทุน?",
    shortLabel: "สินค้าเสี่ยง",
    description: "ดู SKU ที่กำไรหรือ Margin ต่ำสุดก่อน",
  },
  {
    type: "best_sku",
    label: "สินค้าไหนทำกำไรดีที่สุด?",
    shortLabel: "สินค้าทำเงิน",
    description: "หา SKU ที่สร้างกำไรจริงสูงสุดในข้อมูลชุดนี้",
  },
  {
    type: "next_action",
    label: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
    shortLabel: "สิ่งที่ควรตรวจ",
    description: "จัดลำดับจุดที่ควรตรวจจากความเสี่ยงของข้อมูลจริง",
  },
];

const feeThaiLabels: Record<FeeKey, string> = {
  commission: "Commission",
  payment_fee: "Payment Fee",
  service_fee: "Service Fee",
  affiliate: "Affiliate",
  ads: "Ads",
  discount: "Seller Discount",
  refunds: "Refund / Return",
};

function ratio(value: number, revenue: number) {
  return revenue > 0 ? value / revenue : 0;
}

function dataPeriod(rows: SellerRow[]) {
  const dates = rows
    .map((row) => row.date)
    .filter(Boolean)
    .sort();

  if (!dates.length) {
    return `${rows.length} แถวข้อมูล`;
  }

  const first = dates[0];
  const last = dates[dates.length - 1];

  if (first === last) {
    return `${rows.length} แถวข้อมูล • ${first}`;
  }

  return `${rows.length} แถวข้อมูล • ${first} ถึง ${last}`;
}

function highestFee(rows: SellerRow[]) {
  const summary = totals(rows);
  const key = [...feeKeys].sort(
    (a, b) => summary[b] - summary[a],
  )[0];

  return {
    key,
    amount: summary[key],
    share: ratio(summary[key], summary.revenue),
  };
}

function profitSummary(rows: SellerRow[]): AiOwnerInsight {
  const summary = totals(rows);
  const marginTone: AiOwnerTone =
    summary.profit < 0
      ? "critical"
      : summary.margin < 0.1
        ? "warning"
        : "good";

  return {
    type: "profit_summary",
    question: "เดือนนี้เหลือจริงเท่าไร?",
    eyebrow: "TRUE PROFIT",
    title:
      summary.profit >= 0
        ? `เหลือจริง ${money(summary.profit)}`
        : `ขาดทุนจริง ${money(Math.abs(summary.profit))}`,
    summary:
      summary.profit >= 0
        ? `จากยอดขาย ${money(summary.revenue)} ร้านเหลือ Margin ${percent(summary.margin)} หลังหักต้นทุนสินค้าและค่าใช้จ่ายที่อยู่ในข้อมูลแล้ว`
        : `ยอดขาย ${money(summary.revenue)} ยังไม่ครอบคลุมต้นทุนและค่าใช้จ่ายทั้งหมดในข้อมูลชุดนี้`,
    tone: marginTone,
    evidence: [
      {
        label: "ยอดขาย",
        value: money(summary.revenue),
      },
      {
        label: "กำไรจริง",
        value: money(summary.profit),
      },
      {
        label: "Margin",
        value: percent(summary.margin),
      },
      {
        label: "จำนวนชิ้น",
        value: summary.qty.toLocaleString("th-TH"),
      },
    ],
    actionTitle: "สิ่งที่ควรดูต่อ",
    action:
      summary.margin < 0.1
        ? "Margin ค่อนข้างบาง ลองเปิดคำถาม “เงินรั่วตรงไหนมากที่สุด?” เพื่อดูค่าใช้จ่ายที่ควรตรวจเป็นลำดับถัดไป"
        : "Margin ยังเป็นบวก ลองดู SKU ที่ทำกำไรดีที่สุดและ SKU ที่เสี่ยง เพื่อดูว่ากำไรมาจากสินค้ากลุ่มไหน",
    dataNote: dataPeriod(rows),
  };
}

function profitLeak(rows: SellerRow[]): AiOwnerInsight {
  const summary = totals(rows);
  const leak = highestFee(rows);
  const sortedFees = [...feeKeys]
    .map((key) => ({ key, value: summary[key] }))
    .sort((a, b) => b.value - a.value);
  const second = sortedFees[1];

  if (leak.amount <= 0) {
    return {
      type: "profit_leak",
      question: "เงินรั่วตรงไหนมากที่สุด?",
      eyebrow: "PROFIT LEAK",
      title: "ยังไม่พบค่าใช้จ่ายนอก COGS ในข้อมูลชุดนี้",
      summary:
        "ค่าธรรมเนียม Ads Affiliate ส่วนลด และ Refund ที่ระบบรู้จักเป็นศูนย์ทั้งหมด จึงยังชี้จุดรั่วไม่ได้",
      tone: "neutral",
      evidence: [
        { label: "ยอดขาย", value: money(summary.revenue) },
        { label: "ค่าใช้จ่ายนอก COGS", value: money(summary.nonCogsCost) },
      ],
      actionTitle: "สิ่งที่ควรตรวจ",
      action:
        "ตรวจไฟล์ Import ว่ามีคอลัมน์ Fee, Ads, Affiliate, Discount และ Refund ครบหรือไม่",
      dataNote: dataPeriod(rows),
    };
  }

  return {
    type: "profit_leak",
    question: "เงินรั่วตรงไหนมากที่สุด?",
    eyebrow: "PROFIT LEAK",
    title: `${feeThaiLabels[leak.key]} สูงสุด ${money(leak.amount)}`,
    summary: `${feeThaiLabels[leak.key]} คิดเป็น ${percent(leak.share)} ของยอดขายรวม และเป็นค่าใช้จ่ายนอก COGS ที่สูงที่สุดในข้อมูลชุดนี้`,
    tone: leak.share >= 0.15 ? "critical" : leak.share >= 0.08 ? "warning" : "neutral",
    evidence: [
      {
        label: "ค่าใช้จ่ายสูงสุด",
        value: money(leak.amount),
        detail: feeThaiLabels[leak.key],
      },
      {
        label: "% ของยอดขาย",
        value: percent(leak.share),
      },
      {
        label: "อันดับ 2",
        value: second ? money(second.value) : "-",
        detail: second ? feeThaiLabels[second.key] : undefined,
      },
      {
        label: "ค่าใช้จ่ายนอก COGS ทั้งหมด",
        value: money(summary.nonCogsCost),
      },
    ],
    actionTitle: "สิ่งที่ควรตรวจ",
    action: `เปิดรายละเอียด ${feeThaiLabels[leak.key]} แยกตาม Platform หรือ SKU ก่อน เพื่อดูว่าค่าใช้จ่ายก้อนนี้มาจากสินค้าหรือช่องทางใดมากที่สุด`,
    dataNote: dataPeriod(rows),
  };
}

function riskSku(rows: SellerRow[]): AiOwnerInsight {
  const products = aggregateBy(rows, "sku");
  const negative = products
    .filter((item) => item.profit < 0)
    .sort((a, b) => a.profit - b.profit);

  const risk =
    negative[0] ??
    [...products].sort((a, b) => a.margin - b.margin)[0];

  if (!risk) {
    return profitSummary(rows);
  }

  const isNegative = risk.profit < 0;

  return {
    type: "risk_sku",
    question: "สินค้าไหนเสี่ยงขาดทุน?",
    eyebrow: "SKU RISK",
    title: `${risk.sku} • ${risk.product}`,
    summary: isNegative
      ? `SKU นี้ขาดทุน ${money(Math.abs(risk.profit))} จากข้อมูลชุดนี้ และมี Margin ${percent(risk.margin)}`
      : `ยังไม่พบ SKU ที่ขาดทุน แต่ ${risk.sku} มี Margin ต่ำสุดที่ ${percent(risk.margin)} จึงควรตรวจเป็นตัวแรก`,
    tone: isNegative ? "critical" : risk.margin < 0.1 ? "warning" : "neutral",
    evidence: [
      { label: "ยอดขาย SKU", value: money(risk.revenue) },
      { label: "กำไร SKU", value: money(risk.profit) },
      { label: "Margin", value: percent(risk.margin) },
      {
        label: "ค่าใช้จ่ายนอก COGS",
        value: money(risk.totalCost),
      },
    ],
    actionTitle: "สิ่งที่ควรตรวจ",
    action:
      "ตรวจราคาขาย ต้นทุนสินค้า Ads Affiliate ส่วนลด และ Refund ของ SKU นี้ก่อนตัดสินใจเพิ่มยอดขายหรือเข้าร่วมโปรโมชัน",
    dataNote: dataPeriod(rows),
  };
}

function bestSku(rows: SellerRow[]): AiOwnerInsight {
  const best = aggregateBy(rows, "sku").sort(
    (a, b) => b.profit - a.profit,
  )[0];

  if (!best) {
    return profitSummary(rows);
  }

  return {
    type: "best_sku",
    question: "สินค้าไหนทำกำไรดีที่สุด?",
    eyebrow: "TOP PROFIT SKU",
    title: `${best.sku} • ${best.product}`,
    summary: `SKU นี้สร้างกำไรจริงสูงสุด ${money(best.profit)} จากยอดขาย ${money(best.revenue)} ในข้อมูลชุดนี้`,
    tone: best.profit > 0 ? "good" : "warning",
    evidence: [
      { label: "กำไร SKU", value: money(best.profit) },
      { label: "Margin", value: percent(best.margin) },
      { label: "ยอดขาย SKU", value: money(best.revenue) },
      {
        label: "จำนวนชิ้น",
        value: best.qty.toLocaleString("th-TH"),
      },
    ],
    actionTitle: "สิ่งที่ควรตรวจ",
    action:
      best.profit > 0
        ? "ดูว่า SKU นี้ทำกำไรดีใน Platform ไหน และตรวจ Stock/งบ Ads ก่อนเพิ่มยอด เพื่อไม่ให้ Margin ลดลงเมื่อ scale"
        : "แม้จะเป็น SKU ที่ดีที่สุด แต่กำไรยังไม่เป็นบวก ควรตรวจโครงสร้างราคาและต้นทุนทั้งร้านก่อนเพิ่มยอดขาย",
    dataNote: dataPeriod(rows),
  };
}

function nextAction(rows: SellerRow[]): AiOwnerInsight {
  const summary = totals(rows);
  const products = aggregateBy(rows, "sku");
  const negative = products
    .filter((item) => item.profit < 0)
    .sort((a, b) => a.profit - b.profit)[0];
  const leak = highestFee(rows);
  const adsShare = ratio(summary.ads, summary.revenue);
  const refundShare = ratio(summary.refunds, summary.revenue);

  if (negative) {
    return {
      type: "next_action",
      question: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
      eyebrow: "NEXT CHECK",
      title: `ตรวจ ${negative.sku} ก่อน`,
      summary: `${negative.sku} เป็น SKU ที่ขาดทุนมากที่สุดในข้อมูลชุดนี้ที่ ${money(negative.profit)} จึงเป็นจุดที่ควรตรวจเหตุผลก่อนเพิ่มยอดขาย`,
      tone: "critical",
      evidence: [
        { label: "กำไร SKU", value: money(negative.profit) },
        { label: "Margin", value: percent(negative.margin) },
        { label: "ยอดขาย SKU", value: money(negative.revenue) },
      ],
      actionTitle: "ลำดับการตรวจ",
      action:
        "1) ราคาขายและส่วนลด 2) COGS 3) Ads/Affiliate 4) Refund จากนั้นค่อยดูว่าควรปรับราคา ลดค่าใช้จ่าย หรือหยุดแคมเปญใด",
      dataNote: dataPeriod(rows),
    };
  }

  if (summary.margin < 0.1) {
    return {
      type: "next_action",
      question: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
      eyebrow: "NEXT CHECK",
      title: `ตรวจ ${feeThaiLabels[leak.key]} ก่อน`,
      summary: `Margin ร้านอยู่ที่ ${percent(summary.margin)} และ ${feeThaiLabels[leak.key]} เป็นค่าใช้จ่ายนอก COGS ที่สูงที่สุด`,
      tone: "warning",
      evidence: [
        { label: "Margin ร้าน", value: percent(summary.margin) },
        { label: feeThaiLabels[leak.key], value: money(leak.amount) },
        { label: "% ของยอดขาย", value: percent(leak.share) },
      ],
      actionTitle: "ลำดับการตรวจ",
      action: `แยก ${feeThaiLabels[leak.key]} ตาม Platform และ SKU แล้วดูว่ารายการใดมีค่าใช้จ่ายสูงแต่กำไรต่ำ`,
      dataNote: dataPeriod(rows),
    };
  }

  if (adsShare >= 0.15) {
    return {
      type: "next_action",
      question: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
      eyebrow: "NEXT CHECK",
      title: "ตรวจ Ads efficiency ก่อน",
      summary: `ค่า Ads อยู่ที่ ${money(summary.ads)} หรือ ${percent(adsShare)} ของยอดขายรวม`,
      tone: "warning",
      evidence: [
        { label: "Ads", value: money(summary.ads) },
        { label: "% ของยอดขาย", value: percent(adsShare) },
        { label: "กำไรจริง", value: money(summary.profit) },
      ],
      actionTitle: "ลำดับการตรวจ",
      action:
        "ดู SKU หรือ Platform ที่มี Ads สูงแต่ Margin ต่ำก่อน อย่าเพิ่มงบจากยอดขายเพียงอย่างเดียว",
      dataNote: dataPeriod(rows),
    };
  }

  if (refundShare >= 0.05) {
    return {
      type: "next_action",
      question: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
      eyebrow: "NEXT CHECK",
      title: "ตรวจ Refund / Return ก่อน",
      summary: `Refund / Return อยู่ที่ ${money(summary.refunds)} หรือ ${percent(refundShare)} ของยอดขายรวม`,
      tone: "warning",
      evidence: [
        { label: "Refund / Return", value: money(summary.refunds) },
        { label: "% ของยอดขาย", value: percent(refundShare) },
        { label: "กำไรจริง", value: money(summary.profit) },
      ],
      actionTitle: "ลำดับการตรวจ",
      action:
        "หา SKU และช่องทางที่มี Refund สูง แล้วตรวจสาเหตุสินค้า ขนส่ง รายละเอียดสินค้า หรือคุณภาพออเดอร์",
      dataNote: dataPeriod(rows),
    };
  }

  const best = products.sort((a, b) => b.profit - a.profit)[0];

  return {
    type: "next_action",
    question: "ตอนนี้ควรตรวจอะไรเป็นอันดับแรก?",
    eyebrow: "NEXT CHECK",
    title: best ? `ดูโอกาสจาก ${best.sku}` : "ตรวจภาพรวมกำไรต่อ",
    summary: best
      ? `ยังไม่พบสัญญาณเสี่ยงหลักจากกฎ Beta และ ${best.sku} เป็น SKU ที่สร้างกำไรสูงสุด ${money(best.profit)}`
      : `ยังไม่พบจุดที่ต้องเตือนเป็นพิเศษจากกฎ Beta`,
    tone: "good",
    evidence: [
      { label: "Margin ร้าน", value: percent(summary.margin) },
      { label: "กำไรจริง", value: money(summary.profit) },
      ...(best
        ? [
            {
              label: "Top SKU",
              value: money(best.profit),
              detail: best.sku,
            },
          ]
        : []),
    ],
    actionTitle: "สิ่งที่ควรตรวจ",
    action: best
      ? "เช็กว่า SKU นี้มี Stock และ Margin เพียงพอก่อนเพิ่มยอดขาย พร้อมเฝ้าดู Ads/Fee ไม่ให้โตเร็วกว่ากำไร"
      : "นำเข้าข้อมูลเพิ่มเพื่อให้ระบบมีหลักฐานเพียงพอสำหรับจัดลำดับสิ่งที่ควรตรวจ",
    dataNote: dataPeriod(rows),
  };
}

export function buildAiOwnerInsight(
  rows: SellerRow[],
  type: AiOwnerQuestionType,
): AiOwnerInsight {
  switch (type) {
    case "profit_summary":
      return profitSummary(rows);
    case "profit_leak":
      return profitLeak(rows);
    case "risk_sku":
      return riskSku(rows);
    case "best_sku":
      return bestSku(rows);
    case "next_action":
      return nextAction(rows);
  }
}
