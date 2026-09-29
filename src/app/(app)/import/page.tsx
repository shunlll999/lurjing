"use client";

import { DragEvent, useRef, useState } from "react";
import Link from "next/link";
import { useSellerData } from "@/components/seller-data-provider";
import { parseSellerCsv } from "@/lib/csv";

type ImportState =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const schema = [
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
];

export default function ImportPage() {
  const { setRows } = useSellerData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ type: "idle", message: "" });
  const [fileName, setFileName] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  const importFile = async (file: File) => {
    setFileName(file.name);
    setState({ type: "idle", message: "" });

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setRowCount(0);
      setState({ type: "error", message: "ไฟล์ต้องเป็น .csv เท่านั้น" });
      return;
    }

    try {
      const parsedRows = parseSellerCsv(await file.text());

      if (!parsedRows.length) {
        throw new Error("ไฟล์นี้ไม่มีรายการขายที่อ่านได้");
      }

      setRows(parsedRows);
      setRowCount(parsedRows.length);
      setState({
        type: "success",
        message: `นำเข้าสำเร็จ ${parsedRows.length.toLocaleString("th-TH")} แถว พร้อมดู Dashboard ได้แล้ว`,
      });
    } catch (error) {
      setRowCount(0);
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "อ่านไฟล์ไม่ได้",
      });
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void importFile(file);
  };

  return (
    <div className="import-page">
      <section className="card import-intro">
        <div>
          <p className="eyebrow">IMPORT SALES DATA</p>
          <h2>เอาข้อมูลร้านเข้ามา แล้วดูว่าเหลือกำไรจริงเท่าไร</h2>
          <p className="muted">
            POC นี้เริ่มจาก CSV ก่อน เพื่อทดสอบว่าการวิเคราะห์กำไรและต้นทุนตอบโจทย์จริง
            ก่อนเชื่อม Shopee, TikTok Shop และ Lazada API
          </p>
        </div>

        <div className="import-step-summary">
          <span>ใช้เวลา 3 ขั้นตอน</span>
          <strong>โหลดตัวอย่าง → ใส่ข้อมูล → Upload</strong>
        </div>
      </section>

      <section className="import-layout section-space">
        <article className="card import-upload-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">UPLOAD CSV</p>
              <h2>เลือกไฟล์ยอดขายของร้าน</h2>
            </div>
            <span className="tag">Local only</span>
          </div>

          <input
            ref={inputRef}
            className="file-input-hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
              event.currentTarget.value = "";
            }}
          />

          <div
            className={dragging ? "upload-dropzone dragging" : "upload-dropzone"}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={handleDrop}
          >
            <div className="upload-icon" aria-hidden="true">↑</div>
            <strong>ลากไฟล์ CSV มาวางที่นี่</strong>
            <span>หรือเลือกไฟล์จากเครื่อง</span>
            <button
              type="button"
              className="button primary"
              onClick={() => inputRef.current?.click()}
            >
              เลือกไฟล์ CSV
            </button>
            <small>ไฟล์ถูกอ่านใน browser สำหรับ POC นี้</small>
          </div>

          {fileName && (
            <div className="selected-file">
              <div className="file-badge">CSV</div>
              <div>
                <strong>{fileName}</strong>
                <span>
                  {state.type === "success"
                    ? `${rowCount.toLocaleString("th-TH")} แถว`
                    : "กำลังตรวจสอบ schema"}
                </span>
              </div>
            </div>
          )}

          {state.type !== "idle" && (
            <div className={`import-status ${state.type}`}>
              <strong>{state.type === "success" ? "พร้อมใช้งาน" : "นำเข้าไม่สำเร็จ"}</strong>
              <span>{state.message}</span>
            </div>
          )}

          <div className="import-actions">
            <a className="button secondary" href="/sample-data.csv" download>
              ดาวน์โหลด CSV ตัวอย่าง
            </a>
            {state.type === "success" && (
              <Link className="button primary" href="/">
                ดู Dashboard →
              </Link>
            )}
          </div>
        </article>

        <aside className="card import-guide-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">CSV FORMAT</p>
              <h2>ไฟล์ต้องมีอะไรบ้าง?</h2>
            </div>
          </div>

          <div className="import-steps">
            <div className="import-step">
              <b>1</b>
              <div>
                <strong>ดาวน์โหลดไฟล์ตัวอย่าง</strong>
                <span>ใช้โครง column เดิมเพื่อให้ระบบอ่านได้แน่นอน</span>
              </div>
            </div>

            <div className="import-step">
              <b>2</b>
              <div>
                <strong>แทนข้อมูล Demo ด้วยข้อมูลร้าน</strong>
                <span>1 แถวสามารถเป็นยอดรวมต่อวัน / SKU สำหรับ POC ได้</span>
              </div>
            </div>

            <div className="import-step">
              <b>3</b>
              <div>
                <strong>Upload แล้วดูผลทันที</strong>
                <span>Dashboard, Costs, Simulator และ AI Owner จะใช้ชุดข้อมูลใหม่</span>
              </div>
            </div>
          </div>

          <div className="schema-box">
            <span>Columns ที่รองรับ</span>
            <div className="schema-chips">
              {schema.map((column) => (
                <code key={column}>{column}</code>
              ))}
            </div>
          </div>

          <div className="import-tip">
            <strong>Tip สำหรับ POC</strong>
            <p>
              ถ้ายังไม่มีต้นทุนบางช่อง เช่น Affiliate หรือ Refund ให้ใส่ <code>0</code> ได้
              แต่อย่าลบชื่อ column ออกจาก CSV
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
