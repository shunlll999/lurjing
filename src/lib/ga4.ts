import { getFirebaseApp } from "@/lib/firebase";
import { getTrackingSettings } from "@/lib/product-analytics";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

type GaParam =
  | string
  | number
  | boolean
  | null
  | undefined;

let rawAnalyticsPromise:
  | Promise<import("firebase/analytics").Analytics | null>
  | null = null;

function cleanParams(
  params: Record<string, GaParam>,
) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, 100)
          : value ?? "",
      ]),
  );
}

async function getRawGa4() {
  if (typeof window === "undefined") {
    return null;
  }

  if (rawAnalyticsPromise) {
    return rawAnalyticsPromise;
  }

  rawAnalyticsPromise = (async () => {
    const analyticsModule =
      await import("firebase/analytics");

    if (
      !(await analyticsModule.isSupported())
    ) {
      return null;
    }

    return analyticsModule.getAnalytics(
      getFirebaseApp(),
    );
  })();

  return rawAnalyticsPromise;
}

async function getEnabledGa4() {
  // Consent is checked before Firebase Analytics is imported/initialized.
  if (!hasAnalyticsConsent()) {
    return null;
  }

  const settings =
    await getTrackingSettings();

  if (
    !settings.enabled ||
    !settings.ga4Enabled
  ) {
    return null;
  }

  return getRawGa4();
}

export async function syncGaCollectionSetting() {
  try {
    // Do not initialize GA4 at all until the visitor has opted in.
    if (!hasAnalyticsConsent()) return;

    const settings =
      await getTrackingSettings(true);

    const analytics =
      await getRawGa4();

    if (!analytics) return;

    const {
      setAnalyticsCollectionEnabled,
    } = await import("firebase/analytics");

    setAnalyticsCollectionEnabled(
      analytics,
      Boolean(
        settings.enabled &&
          settings.ga4Enabled,
      ),
    );
  } catch (error) {
    console.warn(
      "[GA4] unable to sync collection setting",
      error,
    );
  }
}

export async function disableGaCollectionIfLoaded() {
  try {
    // If Analytics was never initialized, there is nothing to disable.
    if (!rawAnalyticsPromise) return;

    const analytics = await rawAnalyticsPromise;
    if (!analytics) return;

    const { setAnalyticsCollectionEnabled } =
      await import("firebase/analytics");

    setAnalyticsCollectionEnabled(analytics, false);
  } catch (error) {
    console.warn(
      "[GA4] unable to disable collection",
      error,
    );
  }
}

export async function setGaCollectionEnabled(
  enabled: boolean,
) {
  try {
    const analytics =
      await getRawGa4();

    if (!analytics) return;

    const {
      setAnalyticsCollectionEnabled,
    } = await import("firebase/analytics");

    setAnalyticsCollectionEnabled(
      analytics,
      enabled,
    );
  } catch (error) {
    console.warn(
      "[GA4] unable to change collection setting",
      error,
    );
  }
}

export async function trackGaEvent(
  eventName: string,
  params: Record<string, GaParam> = {},
) {
  try {
    const analytics =
      await getEnabledGa4();

    if (!analytics) return;

    const { logEvent } =
      await import("firebase/analytics");

    logEvent(
      analytics,
      eventName,
      cleanParams(params),
    );
  } catch (error) {
    console.warn(
      `[GA4] unable to log "${eventName}"`,
      error,
    );
  }
}

export async function identifyGaUser(
  user: {
    id: string;
    role: string;
    plan: string;
    isDemo?: boolean;
  } | null,
) {
  try {
    const analytics =
      await getEnabledGa4();

    if (!analytics) return;

    const {
      setUserId,
      setUserProperties,
    } = await import("firebase/analytics");

    // Never send email, display name, store name, or other PII to GA4.
    setUserId(
      analytics,
      user?.id ?? null,
    );

    if (user) {
      setUserProperties(
        analytics,
        {
          account_role: user.role,
          account_plan: user.plan,
          is_demo: user.isDemo ? "true" : "false",
        },
      );
    }
  } catch (error) {
    console.warn(
      "[GA4] unable to identify user",
      error,
    );
  }
}
