"use client";

import { useMemo, useState } from "react";
import { money, percent } from "@/lib/analytics";

type ScenarioKey = "normal" | "affiliate" | "flash" | "ads";

interface Scenario {
  key: ScenarioKey;
  name: string;
  description: string;
  values: {
    commission: number;
    payment: number;
    service: number;
    affiliate: number;
    ads: number;
    discount: number;
  };
}

const scenarios: Scenario[] = [
  {
    key: "normal",
    name: "ขายปกติ",
    description: "ไม่มี Affiliate และไม่ได้อัด Ads หนัก",
    values: { commission: 6.5, payment: 2.5, service: 3, affiliate: 0, ads: 20, discount: 0 },
  },
  {
    key: "affiliate",
    name: "Affiliate",
    description: "ให้ Creator ช่วยขายและจ่าย commission เพิ่ม",
    values: { commission: 6.5, payment: 2.5, service: 3, affiliate: 15, ads: 35, discount: 10 },
  },
  {
    key: "flash",
    name: "Flash Sale",
    description: "ลดราคาเพื่อเร่งยอดขายใน Campaign",
    values: { commission: 6.5, payment: 2.5, service: 3, affiliate: 8, ads: 45, discount: 35 },
  },
  {
    key: "ads",
    name: "เร่ง Ads",
    description: "ใช้โฆษณาหนักเพื่อ Scale ยอดขาย",
    values: { commission: 6.5, payment: 2.5, service: 3, affiliate: 5, ads: 80, discount: 10 },
  },
];

export default function SimulatorPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("affiliate");
  const [productName, setProductName] = useState("Glow Serum 30ml");
  const [sku, setSku] = useState("SERUM-30");
  const [price, setPrice] = useState(299);
  const [cogs, setCogs] = useState(135);
  const [commission, setCommission] = useState(6.5);
  const [payment, setPayment] = useState(2.5);
  const [service, setService] = useState(3);
  const [affiliate, setAffiliate] = useState(15);
  const [ads, setAds] = useState(35);
  const [discount, setDiscount] = useState(10);
  const [targetOrders, setTargetOrders] = useState(100);

  const applyScenario = (next: Scenario) => {
    setScenario(next.key);
    setCommission(next.values.commission);
    setPayment(next.values.payment);
    setService(next.values.service);
    setAffiliate(next.values.affiliate);
    setAds(next.values.ads);
    setDiscount(next.values.discount);
  };

  const result = useMemo(() => {
    const platformRate = (commission + payment + service) / 100;
    const affiliateRate = affiliate / 100;
    const variableRate = platformRate + affiliateRate;

    const platformFee = price * platformRate;
    const affiliateFee = price * affiliateRate;
    const totalCost = cogs + platformFee + affiliateFee + ads + discount;
    const profit = price - totalCost;
    const margin = price ? profit / price : 0;

    const denominatorBreakEven = 1 - variableRate;
    const breakEvenPrice =
      denominatorBreakEven > 0 ? (cogs + ads + discount) / denominatorBreakEven : Infinity;

    const targetMargin = 0.15;
    const denominatorTarget = 1 - variableRate - targetMargin;
    const targetPrice =
      denominatorTarget > 0 ? (cogs + ads + discount) / denominatorTarget : Infinity;

    const projectedRevenue = price * targetOrders;
    const projectedProfit = profit * targetOrders;

    return {
      platformRate,
      platformFee,
      affiliateFee,
      totalCost,
      profit,
      margin,
      breakEvenPrice,
      targetPrice,
      projectedRevenue,
      projectedProfit,
    };
  }, [
    price,
    cogs,
    commission,
    payment,
    service,
    affiliate,
    ads,
    discount,
    targetOrders,
  ]);

  const verdict =
    result.profit < 0
      ? { label: "ขาดทุน", tone: "danger", detail: "ขายเพิ่มก็ยิ่งขาดทุนเพิ่ม" }
      : result.margin < 0.08
        ? { label: "กำไรบางมาก", tone: "danger", detail: "มี Buffer น้อย หากมีคืนสินค้าอาจติดลบ" }
        : result.margin < 0.15
          ? { label: "พอขายได้ แต่เสี่ยง", tone: "warning", detail: "ลองลด Ads / Discount หรือเพิ่มราคา" }
          : { label: "กำไรดูแข็งแรง", tone: "success", detail: "Margin มากกว่าเป้าหมาย 15%" };

  return (
    <div className="simulator-page">
      <section className="card simulator-hero">
        <div>
          <p className="eyebrow">PROMOTION SIMULATOR</p>
          <h2>โปรนี้ขายแล้ว “เหลือจริง” เท่าไร?</h2>
          <p className="muted">
            จำลองก่อนเข้าร่วม Campaign เพื่อดูว่า หลังหักต้นทุน ค่าธรรมเนียม Affiliate และ Ads แล้ว
            ยังมีกำไรอยู่หรือไม่
          </p>
        </div>

        <div className={`sim-verdict ${verdict.tone}`}>
          <span>ผลจำลอง</span>
          <strong>{verdict.label}</strong>
          <small>{verdict.detail}</small>
        </div>
      </section>

      <section className="card section-space">
        <div className="section-head">
          <div>
            <p className="eyebrow">1 · CHOOSE SCENARIO</p>
            <h2>กำลังจะขายแบบไหน?</h2>
            <p className="muted">เลือก preset ก่อน แล้วค่อยแก้ตัวเลขให้ตรงกับร้านจริง</p>
          </div>
        </div>

        <div className="scenario-grid">
          {scenarios.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => applyScenario(item)}
              className={scenario === item.key ? "scenario-card active" : "scenario-card"}
            >
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="simulator-workspace section-space">
        <div className="simulator-input-column">
          <article className="card">
            <div className="section-head">
              <div>
                <p className="eyebrow">2 · PRODUCT</p>
                <h2>ราคาขายและต้นทุนสินค้า</h2>
              </div>
            </div>

            <div className="product-identity-grid">
              <label className="sim-field">
                <span>ชื่อสินค้า</span>
                <div className="input-with-unit text-input">
                  <input
                    type="text"
                    value={productName}
                    placeholder="เช่น Glow Serum 30ml"
                    onChange={(event) => setProductName(event.target.value)}
                  />
                </div>
                <small>ใช้แสดงในผลจำลอง เพื่อให้รู้ว่ากำลังวิเคราะห์สินค้าตัวไหน</small>
              </label>

              <label className="sim-field">
                <span>SKU</span>
                <div className="input-with-unit text-input">
                  <input
                    type="text"
                    value={sku}
                    placeholder="เช่น SERUM-30"
                    onChange={(event) => setSku(event.target.value)}
                  />
                </div>
                <small>ไม่บังคับ แต่ช่วยอ้างอิงกับข้อมูลจริงของร้าน</small>
              </label>
            </div>

            <div className="sim-field-grid two-fields section-mini-space">
              <MoneyField
                label="ราคาที่ลูกค้าจ่าย"
                helper="ราคาขายก่อนหักค่าใช้จ่าย"
                value={price}
                setValue={setPrice}
              />
              <MoneyField
                label="ต้นทุนสินค้า (COGS)"
                helper="ต้นทุนต่อ 1 ออเดอร์"
                value={cogs}
                setValue={setCogs}
              />
            </div>
          </article>

          <article className="card section-space">
            <div className="section-head">
              <div>
                <p className="eyebrow">3 · PLATFORM COST</p>
                <h2>ค่าที่ Platform หักเป็น %</h2>
                <p className="muted">ใส่ตามเรทจริงของร้านหรือ Campaign</p>
              </div>
            </div>

            <div className="sim-field-grid">
              <PercentField label="Commission" value={commission} setValue={setCommission} />
              <PercentField label="Payment fee" value={payment} setValue={setPayment} />
              <PercentField label="Service fee" value={service} setValue={setService} />
              <PercentField label="Affiliate" value={affiliate} setValue={setAffiliate} />
            </div>
          </article>

          <article className="card section-space">
            <div className="section-head">
              <div>
                <p className="eyebrow">4 · SPEND PER ORDER</p>
                <h2>เงินที่เราเป็นคนจ่ายเพิ่ม</h2>
              </div>
            </div>

            <div className="sim-field-grid two-fields">
              <MoneyField
                label="ค่า Ads ต่อ Order"
                helper="เฉลี่ยค่าโฆษณาต่อออเดอร์"
                value={ads}
                setValue={setAds}
              />
              <MoneyField
                label="ส่วนลดที่ร้านออก"
                helper="เฉพาะส่วนที่ร้านเป็นคนรับภาระ"
                value={discount}
                setValue={setDiscount}
              />
            </div>
          </article>
        </div>

        <aside className="card simulator-result-panel">
          <div className="result-panel-head">
            <div>
              <p className="eyebrow">RESULT / 1 ORDER</p>
              <h2>{productName || "สินค้านี้"} ขาย 1 ออเดอร์ เหลือเท่าไร?</h2>
            </div>
            <span className={`result-status ${verdict.tone}`}>{verdict.label}</span>
          </div>

          <div className="sim-product-summary">
            <div>
              <span>สินค้า</span>
              <strong>{productName || "ยังไม่ได้ตั้งชื่อสินค้า"}</strong>
            </div>
            <div>
              <span>SKU</span>
              <strong>{sku || "-"}</strong>
            </div>
            <div>
              <span>Scenario</span>
              <strong>{scenarios.find((item) => item.key === scenario)?.name}</strong>
            </div>
          </div>

          <div className="profit-hero">
            <span>กำไรจริงต่อออเดอร์</span>
            <strong className={result.profit < 0 ? "bad" : "good"}>{money(result.profit)}</strong>
            <small>Margin {percent(result.margin)}</small>
          </div>

          <div className="money-flow">
            <FlowRow label="ลูกค้าจ่าย" value={price} positive />
            <FlowRow label="ต้นทุนสินค้า" value={cogs} />
            <FlowRow
              label={`Platform fee (${percent(result.platformRate)})`}
              value={result.platformFee}
            />
            <FlowRow
              label={`Affiliate (${affiliate.toFixed(1)}%)`}
              value={result.affiliateFee}
            />
            <FlowRow label="Ads" value={ads} />
            <FlowRow label="ส่วนลดร้าน" value={discount} />
            <div className="flow-divider" />
            <FlowRow label="กำไรจริง" value={result.profit} total positive={result.profit >= 0} />
          </div>

          <div className="price-guidance">
            <div>
              <span>ราคาขั้นต่ำที่ไม่ขาดทุน</span>
              <strong>
                {Number.isFinite(result.breakEvenPrice) ? money(Math.ceil(result.breakEvenPrice)) : "คำนวณไม่ได้"}
              </strong>
            </div>
            <div>
              <span>ราคาที่ได้ Margin 15%</span>
              <strong>
                {Number.isFinite(result.targetPrice) ? money(Math.ceil(result.targetPrice)) : "คำนวณไม่ได้"}
              </strong>
            </div>
          </div>

          <div className="sim-recommendation">
            <strong>คำแนะนำ</strong>
            <p>
              {result.profit < 0
                ? `ราคาปัจจุบันต่ำกว่าจุดคุ้มทุนประมาณ ${money(Math.max(0, result.breakEvenPrice - price))} ต่อออเดอร์`
                : result.margin < 0.15
                  ? `ถ้าต้องการ Margin 15% ลองเพิ่มราคาใกล้ ${money(Math.ceil(result.targetPrice))} หรือลด Ads / Affiliate`
                  : "สถานการณ์นี้ผ่านเป้า Margin 15% แล้ว ลองดูผลรวมเมื่อยอดขายเพิ่มด้านล่าง"}
            </p>
          </div>
        </aside>
      </section>

      <section className="card section-space">
        <div className="section-head">
          <div>
            <p className="eyebrow">SCALE IMPACT</p>
            <h2>ถ้า {productName || "สินค้านี้"} ขายได้หลายออเดอร์ จะเหลือเท่าไร?</h2>
          </div>
        </div>

        <div className="scale-grid">
          <label className="field scale-order-field">
            <span>จำนวนออเดอร์ที่คาดว่าจะขายได้</span>
            <input
              type="number"
              min="1"
              value={targetOrders}
              onChange={(event) => setTargetOrders(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>

          <div className="scale-metric">
            <span>ยอดขายรวม</span>
            <strong>{money(result.projectedRevenue)}</strong>
          </div>

          <div className="scale-metric">
            <span>กำไรรวม</span>
            <strong className={result.projectedProfit < 0 ? "bad" : "good"}>
              {money(result.projectedProfit)}
            </strong>
          </div>

          <div className="scale-metric">
            <span>ต้นทุนรวมโดยประมาณ</span>
            <strong>{money(result.totalCost * targetOrders)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function PercentField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <label className="sim-field">
      <span>{label}</span>
      <div className="input-with-unit">
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(event) => setValue(Math.max(0, Number(event.target.value) || 0))}
        />
        <i>%</i>
      </div>
    </label>
  );
}

function MoneyField({
  label,
  helper,
  value,
  setValue,
}: {
  label: string;
  helper: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <label className="sim-field">
      <span>{label}</span>
      <div className="input-with-unit money-unit">
        <i>฿</i>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => setValue(Math.max(0, Number(event.target.value) || 0))}
        />
      </div>
      <small>{helper}</small>
    </label>
  );
}

function FlowRow({
  label,
  value,
  positive = false,
  total = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  total?: boolean;
}) {
  return (
    <div className={total ? "flow-row total" : "flow-row"}>
      <span>{label}</span>
      <strong className={positive ? (value >= 0 ? "good" : "bad") : ""}>
        {positive ? "" : "− "}
        {money(Math.abs(value))}
      </strong>
    </div>
  );
}
