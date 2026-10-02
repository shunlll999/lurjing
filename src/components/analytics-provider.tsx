"use client";

import {
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import {
  identifyGaUser,
  syncGaCollectionSetting,
  trackGaEvent,
} from "@/lib/ga4";

function destinationPath(
  element: Element,
) {
  if (!(element instanceof HTMLAnchorElement)) {
    return "";
  }

  try {
    return new URL(
      element.href,
      window.location.href,
    ).pathname.slice(0, 100);
  } catch {
    return "";
  }
}

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const previousPath =
    useRef<string | null>(null);

  useEffect(() => {
    void syncGaCollectionSetting();
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (user?.role === "admin") {
      void identifyGaUser(null);
      return;
    }

    void identifyGaUser(
      user
        ? {
            id: user.id,
            role: user.role,
            plan: user.plan,
            isDemo: user.isDemo,
          }
        : null,
    );
  }, [ready, user]);

  useEffect(() => {
    if (!ready) return;
    if (user?.role === "admin") return;

    if (
      previousPath.current === pathname
    ) {
      return;
    }

    previousPath.current = pathname;

    void trackGaEvent(
      "route_view",
      {
        page_path: pathname,
        page_title:
          typeof document !== "undefined"
            ? document.title
            : "",
      },
    );
  }, [pathname, ready, user?.role]);

  useEffect(() => {
    if (!ready) return;
    if (user?.role === "admin") return;

    const handleClick = (
      event: MouseEvent,
    ) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactive =
        target.closest(
          [
            "[data-track]",
            "a",
            "button",
            "[role='button']",
            "input[type='submit']",
            "input[type='button']",
          ].join(","),
        );

      if (!interactive) return;

      const trackId =
        interactive.getAttribute(
          "data-track",
        ) ?? "";

      const explicitLabel =
        interactive.getAttribute(
          "data-track-label",
        ) ?? "";

      const elementId =
        interactive.id || "";

      const elementClass =
        typeof interactive.className === "string"
          ? interactive.className
              .split(/\s+/)
              .slice(0, 3)
              .join(" ")
              .slice(0, 80)
          : "";

      void trackGaEvent(
        "ui_click",
        {
          page_path:
            window.location.pathname,
          element_type:
            interactive.tagName.toLowerCase(),
          // Only explicit developer-authored labels are sent.
          // Raw textContent is intentionally excluded to avoid PII.
          element_label:
            explicitLabel.slice(0, 80),
          element_id:
            elementId.slice(0, 80),
          element_class:
            elementClass,
          track_id:
            trackId.slice(0, 80),
          destination_path:
            destinationPath(interactive),
        },
      );
    };

    document.addEventListener(
      "click",
      handleClick,
      { capture: true },
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        { capture: true },
      );
    };
  }, [ready, user?.role]);

  return <>{children}</>;
}
