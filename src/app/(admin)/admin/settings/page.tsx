"use client";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import {
  getTrackingSettings,
  saveTrackingSettings,
} from "@/lib/product-analytics";
import { setGaCollectionEnabled } from "@/lib/ga4";
import { writeAccounts } from "@/lib/auth";
import type { TrackingSettings } from "@/types/analytics";

const settingsKey =
  "lurjing:admin-settings";

interface EarlySettings {
  demoAccountEnabled: boolean;
}

const defaults: EarlySettings = {
  demoAccountEnabled: true,
};

const trackingDefaults: TrackingSettings = {
  enabled: true,
  ga4Enabled: true,
  firestoreEnabled: true,
};

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] =
    useState<EarlySettings>(defaults);

  const [
    tracking,
    setTracking,
  ] = useState<TrackingSettings>(
    trackingDefaults,
  );

  const [saved, setSaved] =
    useState(false);
  const [
    trackingSaved,
    setTrackingSaved,
  ] = useState(false);
  const [
    trackingError,
    setTrackingError,
  ] = useState("");

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          settingsKey,
        );

      if (raw) {
        setSettings({
          ...defaults,
          ...JSON.parse(raw),
        });
      }
    } catch {
      setSettings(defaults);
    }

    void getTrackingSettings(true)
      .then(setTracking)
      .catch(() =>
        setTracking(
          trackingDefaults,
        ),
      );
  }, []);

  const saveLocal = () => {
    window.localStorage.setItem(
      settingsKey,
      JSON.stringify(settings),
    );

    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1600,
    );
  };

  const saveTracking = async () => {
    if (!user) return;

    setTrackingError("");

    try {
      const next =
        await saveTrackingSettings(
          tracking,
          user,
        );

      setTracking(next);

      await setGaCollectionEnabled(
        Boolean(
          next.enabled &&
            next.ga4Enabled,
        ),
      );

      setTrackingSaved(true);

      window.setTimeout(
        () =>
          setTrackingSaved(false),
        1600,
      );
    } catch (error) {
      console.error(
        "[Admin Settings] tracking save failed",
        error,
      );

      setTrackingError(
        "บันทึก Tracking Settings ไม่สำเร็จ",
      );
    }
  };

  const clearUsers = () => {
    if (
      !window.confirm(
        "ล้างเฉพาะ Early user mirror ใน browser นี้หรือไม่? Firebase Auth / Firestore จะไม่ถูกลบ",
      )
    ) {
      return;
    }

    writeAccounts([]);
    window.alert(
      "ล้าง Early user mirror แล้ว",
    );
  };

  return (
    <div className="admin-page">
      <section className="admin-grid">
        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">
                ANALYTICS
              </p>
              <h2>
                Tracking controls
              </h2>
              <p>
                ปิดได้ตลอดเวลาโดยไม่กระทบ
                Auth, Dashboard หรือ Feedback
              </p>
            </div>
          </div>

          <div className="admin-setting-list">
            <label>
              <div>
                <strong>
                  เปิด Product Tracking
                </strong>
                <span>
                  Master switch
                  สำหรับ GA4 และ Firestore Analytics
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  tracking.enabled
                }
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    enabled:
                      event.target
                        .checked,
                  })
                }
              />
            </label>

            <label>
              <div>
                <strong>
                  Google Analytics 4
                </strong>
                <span>
                  Page View + UI Click
                  ไม่ส่ง email หรือชื่อผู้ใช้
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  tracking.ga4Enabled
                }
                disabled={
                  !tracking.enabled
                }
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    ga4Enabled:
                      event.target
                        .checked,
                  })
                }
              />
            </label>

            <label>
              <div>
                <strong>
                  Firestore Important Events
                </strong>
                <span>
                  Register, Login, Profile,
                  Import และ Feedback เท่านั้น
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  tracking.firestoreEnabled
                }
                disabled={
                  !tracking.enabled
                }
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    firestoreEnabled:
                      event.target
                        .checked,
                  })
                }
              />
            </label>
          </div>

          {trackingError && (
            <div className="auth-error">
              {trackingError}
            </div>
          )}

          <button
            className="button primary"
            onClick={() =>
              void saveTracking()
            }
          >
            {trackingSaved
              ? "บันทึกแล้ว ✓"
              : "บันทึก Tracking"}
          </button>
        </article>

        <article className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">
                Early
              </p>
              <h2>
                Demo settings
              </h2>
            </div>
          </div>

          <div className="admin-setting-list">
            <label>
              <div>
                <strong>
                  Demo Account
                </strong>
                <span>
                  Early setting
                  สำหรับทดสอบ UX
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.demoAccountEnabled
                }
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    demoAccountEnabled:
                      event.target
                        .checked,
                  })
                }
              />
            </label>
          </div>

          <button
            className="button secondary"
            onClick={saveLocal}
          >
            {saved
              ? "บันทึกแล้ว ✓"
              : "บันทึก Demo Setting"}
          </button>
        </article>

        <article className="admin-card danger-zone">
          <div className="admin-card-head">
            <div>
              <p className="eyebrow">
                LOCAL Early
              </p>
              <h2>
                Browser mirror
              </h2>
              <p>
                ไม่ลบข้อมูล Firebase จริง
              </p>
            </div>
          </div>

          <div className="danger-action-list">
            <button
              onClick={clearUsers}
            >
              <strong>
                ล้าง Local User Mirror
              </strong>
              <span>
                Firebase Auth /
                Firestore ไม่ได้รับผลกระทบ
              </span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
