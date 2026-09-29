"use client";

import { useEffect, useState } from "react";
import { writeAccounts } from "@/lib/auth";
import { feedbackStorageKey } from "@/lib/feedback";

const settingsKey = "lurjing:admin-settings";

interface POCSettings {
  testimonialsEnabled: boolean;
  maxTestimonials: number;
  demoAccountEnabled: boolean;
}

const defaults: POCSettings = {
  testimonialsEnabled: true,
  maxTestimonials: 6,
  demoAccountEnabled: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<POCSettings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(settingsKey);
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {
      setSettings(defaults);
    }
  }, []);

  const save = () => {
    window.localStorage.setItem(settingsKey, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const clearFeedback = () => {
    if (!window.confirm("ลบ Feedback ทั้งหมดใน browser นี้หรือไม่?")) return;
    window.localStorage.removeItem(feedbackStorageKey);
    window.alert("ลบ Feedback ทั้งหมดแล้ว");
  };

  const clearUsers = () => {
    if (!window.confirm("ลบ Registered users ทั้งหมดใน browser นี้หรือไม่?")) return;
    writeAccounts([]);
    window.alert("ลบ Registered users ทั้งหมดแล้ว");
  };

  const resetEverything = () => {
    if (!window.confirm("รีเซ็ต Users, Feedback และ Settings ทั้งหมดหรือไม่?")) return;
    window.localStorage.removeItem(feedbackStorageKey);
    window.localStorage.removeItem(settingsKey);
    writeAccounts([]);
    setSettings(defaults);
    window.alert("POC ถูกรีเซ็ตแล้ว");
  };

  return (
    <div className="admin-page">
      <section className="admin-grid">
        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">LANDING PAGE</p>
              <h2>Testimonial settings</h2>
            </div>
          </div>

          <div className="admin-setting-list">
            <label>
              <div>
                <strong>เปิด Testimonial section</strong>
                <span>แสดง Feedback ที่ Approved บน Landing Page</span>
              </div>
              <input
                type="checkbox"
                checked={settings.testimonialsEnabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    testimonialsEnabled: event.target.checked,
                  })
                }
              />
            </label>

            <label>
              <div>
                <strong>จำนวน Testimonial สูงสุด</strong>
                <span>Featured จะถูกเรียงขึ้นก่อน</span>
              </div>
              <input
                className="admin-number-input"
                type="number"
                min={1}
                max={12}
                value={settings.maxTestimonials}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    maxTestimonials: Math.min(
                      12,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  })
                }
              />
            </label>

            <label>
              <div>
                <strong>Demo Account</strong>
                <span>POC setting สำหรับทดสอบ UX</span>
              </div>
              <input
                type="checkbox"
                checked={settings.demoAccountEnabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    demoAccountEnabled: event.target.checked,
                  })
                }
              />
            </label>
          </div>

          <button className="button primary" onClick={save}>
            {saved ? "บันทึกแล้ว ✓" : "บันทึก Settings"}
          </button>
        </article>

        <article className="admin-card danger-zone">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">DANGER ZONE</p>
              <h2>Reset POC data</h2>
              <p>ล้างข้อมูลเฉพาะ browser ที่กำลังใช้อยู่</p>
            </div>
          </div>

          <div className="danger-action-list">
            <button onClick={clearFeedback}>
              <strong>ลบ Feedback ทั้งหมด</strong>
              <span>ไม่กระทบ User</span>
            </button>
            <button onClick={clearUsers}>
              <strong>ลบ Registered users</strong>
              <span>Demo / Admin system account ยังอยู่</span>
            </button>
            <button className="critical" onClick={resetEverything}>
              <strong>Reset ทุกอย่าง</strong>
              <span>Users + Feedback + Settings</span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
