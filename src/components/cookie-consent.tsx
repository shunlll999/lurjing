"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCookieConsent,
  saveCookieConsent,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";

type SettingsState = {
  analytics: boolean;
};

export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    analytics: false,
  });

  useEffect(() => {
    const consent = getCookieConsent();

    setHasChoice(Boolean(consent));
    setSettings({
      analytics: consent?.analytics ?? false,
    });
    setReady(true);
  }, []);

  const commitChoice = (choice: CookieConsentChoice) => {
    saveCookieConsent(choice);
    setHasChoice(true);
    setSettings({ analytics: choice === "all" });
    setSettingsOpen(false);
  };

  const saveSettings = () => {
    commitChoice(settings.analytics ? "all" : "necessary");
  };

  if (!ready) return null;

  return (
    <>
      {!hasChoice && (
        <aside
          className="cookie-banner"
          data-cookie-control
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="cookie-banner-copy">
            <div className="cookie-banner-icon" aria-hidden="true">
              🍪
            </div>
            <div>
              <h2 id="cookie-banner-title">จัดการคุกกี้ของคุณ</h2>
              <p id="cookie-banner-description">
                เหลือจริงใช้พื้นที่จัดเก็บที่จำเป็นเพื่อให้ระบบทำงาน และจะเปิดใช้ Analytics
                เพื่อวัดการใช้งานเว็บไซต์เมื่อคุณยินยอมเท่านั้น
                <Link href="/cookies"> อ่านนโยบายคุกกี้</Link>
              </p>
            </div>
          </div>

          <div className="cookie-banner-actions">
            <button
              type="button"
              className="button secondary cookie-action"
              onClick={() => commitChoice("necessary")}
            >
              ใช้เฉพาะที่จำเป็น
            </button>
            <button
              type="button"
              className="button secondary cookie-action"
              onClick={() => setSettingsOpen(true)}
            >
              ตั้งค่า
            </button>
            <button
              type="button"
              className="button primary cookie-action"
              onClick={() => commitChoice("all")}
            >
              ยอมรับทั้งหมด
            </button>
          </div>
        </aside>
      )}

      {hasChoice && (
        <button
          type="button"
          className="cookie-settings-badge"
          data-cookie-control
          onClick={() => setSettingsOpen(true)}
          aria-label="เปิดการตั้งค่าคุกกี้"
        >
          <span aria-hidden="true">🍪</span>
          <span>คุกกี้</span>
        </button>
      )}

      {settingsOpen && (
        <div
          className="cookie-modal-backdrop"
          data-cookie-control
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && hasChoice) {
              setSettingsOpen(false);
            }
          }}
        >
          <section
            className="cookie-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
          >
            <div className="cookie-modal-head">
              <div>
                <p className="eyebrow">COOKIE SETTINGS</p>
                <h2 id="cookie-settings-title">ตั้งค่าคุกกี้</h2>
              </div>

              {hasChoice && (
                <button
                  type="button"
                  className="cookie-close"
                  onClick={() => setSettingsOpen(false)}
                  aria-label="ปิดการตั้งค่าคุกกี้"
                >
                  ×
                </button>
              )}
            </div>

            <p className="cookie-modal-intro">
              คุณเลือกได้ว่าจะอนุญาต Analytics หรือไม่ โดยคุกกี้/พื้นที่จัดเก็บที่จำเป็นต่อการทำงานของระบบจะเปิดใช้งานเสมอ
            </p>

            <div className="cookie-preference-list">
              <div className="cookie-preference-row">
                <div>
                  <strong>จำเป็น</strong>
                  <p>ใช้สำหรับ session, ความปลอดภัย และการทำงานพื้นฐานของเว็บไซต์</p>
                </div>
                <span className="cookie-required-pill">เปิดเสมอ</span>
              </div>

              <label className="cookie-preference-row cookie-toggle-row">
                <div>
                  <strong>Analytics</strong>
                  <p>
                    อนุญาต Google Analytics และ event analytics ของเหลือจริง เพื่อช่วยดูว่าฟีเจอร์ไหนถูกใช้งาน
                  </p>
                </div>
                <span className="cookie-switch">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(event) =>
                      setSettings({ analytics: event.target.checked })
                    }
                    aria-label="อนุญาต Analytics"
                  />
                  <span aria-hidden="true" />
                </span>
              </label>
            </div>

            <div className="cookie-modal-footer">
              <Link href="/cookies" className="cookie-policy-link">
                นโยบายคุกกี้
              </Link>
              <div className="cookie-modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => commitChoice("necessary")}
                >
                  ปฏิเสธ Analytics
                </button>
                <button
                  type="button"
                  className="button primary"
                  onClick={saveSettings}
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
