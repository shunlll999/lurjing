import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore/lite";

import { getFirebaseDb } from "@/lib/firebase";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import type {
  AnalyticsEventItem,
  ImportantEventName,
  TrackingSettings,
} from "@/types/analytics";
import type { UserProfile } from "@/types/auth";

const DEFAULT_SETTINGS: TrackingSettings = {
  enabled: true,
  ga4Enabled: true,
  firestoreEnabled: true,
};

const SETTINGS_DOC = "tracking";
const SETTINGS_COLLECTION = "settings";
const EVENTS_COLLECTION = "analytics_events";
const CACHE_MS = 5 * 60 * 1000;

let settingsCache: {
  value: TrackingSettings;
  loadedAt: number;
} | null = null;

let settingsRequest: Promise<TrackingSettings> | null = null;

function browserPath() {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

export async function getTrackingSettings(
  force = false,
): Promise<TrackingSettings> {
  if (
    !force &&
    settingsCache &&
    Date.now() - settingsCache.loadedAt < CACHE_MS
  ) {
    return settingsCache.value;
  }

  // Share one Firestore read between events that arrive at the same time.
  // This is especially useful during initial app boot, where route_view,
  // identifyGaUser, and GA4 setup can run almost together.
  if (settingsRequest) {
    return settingsRequest;
  }

  settingsRequest = (async () => {
    try {
      const snapshot = await getDoc(
        doc(
          getFirebaseDb(),
          SETTINGS_COLLECTION,
          SETTINGS_DOC,
        ),
      );

      const value = snapshot.exists()
        ? {
            ...DEFAULT_SETTINGS,
            ...(snapshot.data() as Partial<TrackingSettings>),
          }
        : DEFAULT_SETTINGS;

      settingsCache = {
        value,
        loadedAt: Date.now(),
      };

      return value;
    } catch (error) {
      console.warn(
        "[Analytics] unable to read tracking settings; using cached defaults",
        error,
      );

      // Cache the fallback too. If Firestore is temporarily unavailable or
      // quota is exhausted, clicks/events must not retry this read repeatedly.
      settingsCache = {
        value: DEFAULT_SETTINGS,
        loadedAt: Date.now(),
      };

      return DEFAULT_SETTINGS;
    } finally {
      settingsRequest = null;
    }
  })();

  return settingsRequest;
}

export async function saveTrackingSettings(
  settings: TrackingSettings,
  adminUser: UserProfile,
) {
  const payload: TrackingSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser.id,
  };

  await setDoc(
    doc(
      getFirebaseDb(),
      SETTINGS_COLLECTION,
      SETTINGS_DOC,
    ),
    payload,
    { merge: true },
  );

  settingsCache = {
    value: payload,
    loadedAt: Date.now(),
  };

  return payload;
}

export async function trackImportantEvent(
  eventName: ImportantEventName,
  user: UserProfile | null,
  metadata: Record<
    string,
    string | number | boolean | null | undefined
  > = {},
) {
  if (!user || user.role === "admin") return;
  if (!hasAnalyticsConsent()) return;

  const settings = await getTrackingSettings();

  if (
    !settings.enabled ||
    !settings.firestoreEnabled
  ) {
    return;
  }

  const safeMetadata = Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value ?? null]),
  ) as Record<
    string,
    string | number | boolean | null
  >;

  try {
    await addDoc(
      collection(
        getFirebaseDb(),
        EVENTS_COLLECTION,
      ),
      {
        eventName,
        userId: user.id,
        displayName: user.displayName,
        storeName: user.storeName,
        role: user.role,
        isDemo: Boolean(user.isDemo),
        pagePath: browserPath(),
        metadata: safeMetadata,
        createdAt: new Date().toISOString(),
      },
    );
  } catch (error) {
    console.warn(
      `[Analytics] Firestore event "${eventName}" was not saved`,
      error,
    );
  }
}

export async function listAnalyticsEvents(
  maximum = 200,
): Promise<AnalyticsEventItem[]> {
  const snapshot = await getDocs(
    query(
      collection(
        getFirebaseDb(),
        EVENTS_COLLECTION,
      ),
      orderBy("createdAt", "desc"),
      limit(maximum),
    ),
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<
      AnalyticsEventItem,
      "id"
    >),
  }));
}
