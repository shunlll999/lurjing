export type CookieConsentChoice = "all" | "necessary";

export type CookieConsentState = {
  version: 1;
  necessary: true;
  analytics: boolean;
  choice: CookieConsentChoice;
  updatedAt: string;
};

export const COOKIE_CONSENT_EVENT = "lurjing:cookie-consent";
export const COOKIE_CONSENT_NAME = "lurjing_cookie_consent";
export const COOKIE_CONSENT_MAX_AGE_DAYS = 180;

function parseCookieValue(value: string): CookieConsentState | null {
  const [version, choice] = value.split(".");

  if (version !== "v1") return null;
  if (choice !== "all" && choice !== "necessary") return null;

  return {
    version: 1,
    necessary: true,
    analytics: choice === "all",
    choice,
    updatedAt: "",
  };
}

export function getCookieConsent(): CookieConsentState | null {
  if (typeof document === "undefined") return null;

  const prefix = `${COOKIE_CONSENT_NAME}=`;
  const raw = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!raw) return null;

  try {
    return parseCookieValue(
      decodeURIComponent(raw.slice(prefix.length)),
    );
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return getCookieConsent()?.analytics === true;
}

export function clearKnownAnalyticsCookies() {
  if (typeof document === "undefined") return;

  const names = document.cookie
    .split(";")
    .map((item) => item.trim().split("=")[0])
    .filter((name) =>
      name === "_ga" ||
      name === "_gid" ||
      name === "_gat" ||
      name.startsWith("_ga_"),
    );

  const hostname = window.location.hostname;
  const domains = ["", hostname];

  if (hostname === "lurjing.com" || hostname.endsWith(".lurjing.com")) {
    domains.push(".lurjing.com");
  }

  for (const name of names) {
    for (const domain of domains) {
      const domainPart = domain ? `; Domain=${domain}` : "";
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domainPart}`;
    }
  }
}

export function saveCookieConsent(choice: CookieConsentChoice) {
  if (typeof document === "undefined") return;

  const maxAge = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const value = encodeURIComponent(`v1.${choice}`);

  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

  if (choice === "necessary") {
    clearKnownAnalyticsCookies();
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsentState>(COOKIE_CONSENT_EVENT, {
      detail: {
        version: 1,
        necessary: true,
        analytics: choice === "all",
        choice,
        updatedAt: new Date().toISOString(),
      },
    }),
  );
}

export function subscribeCookieConsent(
  listener: (state: CookieConsentState) => void,
) {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsentState>;
    listener(customEvent.detail);
  };

  window.addEventListener(COOKIE_CONSENT_EVENT, handler);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
  };
}
