"use client";

import { useState } from "react";
import { useSellerData } from "@/components/seller-data-provider";
import { DataEmptyState } from "@/components/data-empty-state";
import { aggregateBy, feeKeys, feeLabels, money, percent, totals } from "@/lib/analytics";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AiOwnerPage() {
  const { rows, ready } = useSellerData();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "ลองถามว่า “TikTok เสียค่าอะไรเยอะสุด”, “เดือนนี้กำไรเท่าไร” หรือ “สินค้าไหนเสี่ยง”" },
  ]);

  if (!ready) {
    return (
      <section className="card data-loading-state">
        <div className="auth-loading-dot" />
        <span>กำลังเตรียมข้อมูลร้าน...</span>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <DataEmptyState
        title="AI Owner ยังไม่มีข้อมูลให้วิเคราะห์"
        description="นำเข้าข้อมูลร้านก่อน แล้ว AI Owner จะตอบจากยอดขาย ต้นทุน Fee Ads Affiliate และ SKU ของร้านคุณ"
      />
    );
  }

  const ask = (question: string) => {
    const text = question.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: reply(text) }]);
    setInput("");
  };

  const reply = (question: string) => {
    const q = question.toLowerCase();
    const summary = totals(rows);
    const products = aggregateBy(rows, "sku").sort((a, b) => a.margin - b.margin);

    if (q.includes("tiktok")) {
      const tiktok = totals(rows.filter((row) => row.channel === "TikTok Shop"));
      const highest = [...feeKeys].sort((a, b) => tiktok[b] - tiktok[a])[0];
      return `TikTok Shop มี ${feeLabels[highest]} สูงสุด ${money(tiktok[highest])} หรือ ${percent(tiktok[highest] / tiktok.revenue)} ของยอดขาย TikTok`;
    }

    if (q.includes("กำไร")) {
      return `ยอดขายรวม ${money(summary.revenue)} เหลือกำไรจริง ${money(summary.profit)} หรือ Margin ${percent(summary.margin)}`;
    }

    if (q.includes("สินค้า") || q.includes("เสี่ยง")) {
      const risk = products[0];
      return `${risk.sku} น่าเช็กที่สุด เพราะ Margin ต่ำสุด ${percent(risk.margin)} และมีค่าใช้จ่ายนอกต้นทุนสินค้า ${money(risk.totalCost)}`;
    }

    return `ตอนนี้ร้านมียอดขาย ${money(summary.revenue)} และกำไร ${money(summary.profit)} ลองถามเรื่อง TikTok, กำไร หรือสินค้าเสี่ยงได้ครับ`;
  };

  return (
    <section className="chat-layout">
      <article className="card chat-card">
        <div className="section-head"><div><p className="eyebrow">POC ASSISTANT</p><h2>AI Owner</h2></div></div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role}`}>{message.text}</div>
          ))}
        </div>
        <div className="quick-actions">
          {["TikTok เสียค่าอะไรเยอะสุด", "เดือนนี้กำไรเท่าไร", "สินค้าไหนเสี่ยง"].map((question) => (
            <button key={question} className="chip" onClick={() => ask(question)}>{question}</button>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && ask(input)}
            placeholder="ถามเรื่องร้านของคุณ..."
          />
          <button className="button primary" onClick={() => ask(input)}>ส่ง</button>
        </div>
      </article>

      <article className="card">
        <div className="section-head"><div><p className="eyebrow">NEXT</p><h2>เวอร์ชันจริง</h2></div></div>
        <div className="insight"><strong>Tool calling</strong><span>ให้ LLM เรียก analytics functions แทนการเดาตัวเลข</span></div>
        <div className="insight"><strong>Explainable answer</strong><span>ทุกคำตอบลิงก์กลับไปยัง order / SKU / fee ที่ใช้คำนวณ</span></div>
        <div className="insight"><strong>Action recommendation</strong><span>เสนอสิ่งที่ควรทำพร้อมผลกระทบต่อกำไรโดยประมาณ</span></div>
      </article>
    </section>
  );
}
