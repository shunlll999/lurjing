"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { DataEmptyState } from "@/components/data-empty-state";
import { useSellerData } from "@/components/seller-data-provider";
import {
  AI_OWNER_QUESTIONS,
  buildAiOwnerInsight,
  type AiOwnerQuestionType,
} from "@/lib/ai-owner";
import { trackGaEvent } from "@/lib/ga4";
import { trackImportantEvent } from "@/lib/product-analytics";

export default function AiOwnerPage() {
  const { user } = useAuth();
  const { rows, ready } = useSellerData();
  const [selected, setSelected] =
    useState<AiOwnerQuestionType>("profit_summary");

  const insight = useMemo(
    () => buildAiOwnerInsight(rows, selected),
    [rows, selected],
  );

  const selectQuestion = (type: AiOwnerQuestionType) => {
    setSelected(type);

    void trackGaEvent(
      "ai_insight_requested",
      {
        question_type: type,
        source: "suggested_question",
      },
    );

    void trackImportantEvent(
      "ai_insight_requested",
      user,
      {
        question_type: type,
        source: "suggested_question",
      },
    );
  };

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
        title="AI Owner Beta ยังไม่มีข้อมูลให้วิเคราะห์"
        description="นำเข้าข้อมูลร้านก่อน แล้ว AI Owner Beta จะช่วยอ่านกำไร Fee Ads Affiliate Refund และ SKU จากข้อมูลจริงของคุณ โดยยังไม่ใช้ AI API"
      />
    );
  }

  return (
    <div className="ai-beta-page">
      <section className="card ai-beta-hero">
        <div>
          <div className="ai-beta-title-row">
            <p className="eyebrow">OWNER COPILOT</p>
            <span className="ai-beta-badge">BETA</span>
          </div>

          <h2>AI Owner Beta</h2>
          <p className="muted">
            ช่วยอ่านตัวเลขร้านจาก Calculation Engine ของ LurJing
            เท่านั้น — เวอร์ชันนี้ยังไม่ใช้ LLM และไม่เรียก AI API
          </p>
        </div>

        <div className="ai-beta-mode">
          <span>โหมดปัจจุบัน</span>
          <strong>Rule-based Insight</strong>
          <small>ค่า AI API = 0</small>
        </div>
      </section>

      <section className="ai-beta-layout section-space">
        <aside className="card ai-beta-questions">
          <div className="section-head">
            <div>
              <p className="eyebrow">ASK FROM REAL DATA</p>
              <h2>อยากรู้เรื่องอะไร?</h2>
            </div>
          </div>

          <div className="ai-beta-question-list">
            {AI_OWNER_QUESTIONS.map((question) => (
              <button
                key={question.type}
                type="button"
                className={`ai-beta-question ${
                  selected === question.type ? "active" : ""
                }`}
                data-track="ai-owner-question"
                data-track-label={question.type}
                onClick={() => selectQuestion(question.type)}
              >
                <span>{question.shortLabel}</span>
                <strong>{question.label}</strong>
                <small>{question.description}</small>
              </button>
            ))}
          </div>
        </aside>

        <article className={`card ai-beta-answer tone-${insight.tone}`}>
          <div className="ai-beta-answer-head">
            <div>
              <p className="eyebrow">{insight.eyebrow}</p>
              <span className="ai-beta-question-label">
                {insight.question}
              </span>
              <h2>{insight.title}</h2>
            </div>

            <span className="ai-beta-source">ข้อมูลจริง</span>
          </div>

          <p className="ai-beta-summary">{insight.summary}</p>

          <div className="ai-beta-evidence-grid">
            {insight.evidence.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                {item.detail && <small>{item.detail}</small>}
              </div>
            ))}
          </div>

          <div className="ai-beta-action">
            <div className="ai-beta-action-icon">→</div>
            <div>
              <strong>{insight.actionTitle}</strong>
              <p>{insight.action}</p>
            </div>
          </div>

          <div className="ai-beta-data-note">
            <span>วิเคราะห์จาก</span>
            <strong>{insight.dataNote}</strong>
          </div>
        </article>
      </section>

      <section className="ai-beta-explain section-space">
        <article className="card">
          <p className="eyebrow">HOW IT WORKS</p>
          <h3>AI Owner Beta ไม่ได้เดาตัวเลข</h3>
          <p>
            Revenue, COGS, Fee, Ads, Affiliate, Discount, Refund และกำไร
            ถูกคำนวณโดย LurJing ก่อน จากนั้นกฎ Beta จึงเลือก Insight
            และสิ่งที่ควรตรวจต่อ
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">WHY BETA</p>
          <h3>ใช้เพื่อพิสูจน์ว่าคนต้องการ Insight แบบไหน</h3>
          <p>
            เมื่อผู้ใช้กดคำถาม ระบบจะเก็บเฉพาะประเภทคำถาม
            <code> ai_insight_requested </code>
            เพื่อดูว่าคำถามใดมีคุณค่าจริง ก่อนลงทุนต่อ LLM
          </p>
        </article>

        <article className="card">
          <p className="eyebrow">LIMIT</p>
          <h3>คำแนะนำคือจุดให้ตรวจ ไม่ใช่คำตอบสุดท้าย</h3>
          <p>
            Beta วิเคราะห์เฉพาะข้อมูลที่ Import เข้ามา ถ้าต้นทุนหรือ Fee
            บางรายการหาย ผลลัพธ์ก็จะสะท้อนข้อมูลเท่าที่ระบบได้รับ
          </p>
        </article>
      </section>
    </div>
  );
}
