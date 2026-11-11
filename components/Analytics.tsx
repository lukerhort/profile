"use client";

import { useEffect } from "react";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/** One delegated click listener that reports gtag events. Safe no-op without gtag. */
export default function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const a = target.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (typeof gtag !== "function") return;

      const raw = a.getAttribute("href") ?? "";
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      const params = { link_url: a.href, link_text: (a.textContent ?? "").trim().slice(0, 80) };
      const external = /^https?:$/.test(url.protocol) && url.origin !== window.location.origin;

      try {
        if (url.pathname.toLowerCase().endsWith(".pdf")) {
          gtag("event", "resume_download", params);
        } else if (a.closest("#projects") && external) {
          gtag("event", "project_click", params);
        } else if (raw.startsWith("mailto:") || a.closest("#contact")) {
          gtag("event", "contact_click", params);
        } else if (external) {
          gtag("event", "outbound_click", params);
        }
      } catch {
        /* analytics must never break navigation */
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
