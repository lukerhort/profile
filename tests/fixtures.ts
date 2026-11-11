import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

export { expect };

/** Third-party hosts (GA/GTM) are stubbed so tests are offline-safe and deterministic. */
export async function blockThirdParty(context: BrowserContext, baseURL: string) {
  const origin = new URL(baseURL).origin;
  await context.route(
    (url) => url.origin !== origin && /^https?:$/.test(url.protocol),
    (route) => {
      const type = route.request().resourceType();
      if (type === "script") return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
      return route.fulfill({ status: 204, body: "" });
    },
  );
}

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await blockThirdParty(context, baseURL!);
    await use(context);
  },
});

/**
 * Scroll the whole page in viewport-sized steps, waiting a couple of frames at each
 * step so scroll-driven (Lenis/GSAP) handlers run. Uses window.scrollTo, which
 * Lenis and ScrollTrigger both observe via native scroll events.
 */
export async function scrollThrough(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.floor(window.innerHeight * 0.6));
  for (let y = 0; y <= total; y += step) {
    await page.evaluate(
      (top) =>
        new Promise<void>((resolve) => {
          window.scrollTo(0, top);
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 60)));
        }),
      y,
    );
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

/** Resolves once the page has hydrated and GSAP has registered its scroll triggers. */
export async function waitForReady(page: Page) {
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Elements carrying reveal/hero animation hooks whose *effective* opacity
 * (own x ancestors) is below 1 or that are visibility:hidden / display:none.
 * Elements that legitimately fade (hero copy scrubbed out, the inactive cards
 * of the pinned experience stage) are excluded via `ignore` selectors.
 */
export async function hiddenTextElements(page: Page, ignore: string[] = []): Promise<string[]> {
  return page.evaluate((ignoreSel) => {
    const out: string[] = [];
    const nodes = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-hero-in], section h1, section h2, section h3",
    );
    nodes.forEach((el) => {
      if (!(el.textContent ?? "").trim()) return;
      if (ignoreSel.some((s) => el.closest(s))) return;
      let opacity = 1;
      let hidden = false;
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        opacity *= parseFloat(cs.opacity);
        if (cs.visibility === "hidden" || cs.display === "none") hidden = true;
      }
      // Closed <details> content is hidden by design; skip content inside a closed details.
      const det = el.closest("details");
      if (det && !det.open && el.tagName !== "DETAILS" && !el.closest("summary")) return;
      if (hidden || opacity < 0.99) {
        out.push(`${el.tagName.toLowerCase()}: ${(el.textContent ?? "").trim().slice(0, 50)} (opacity ${opacity.toFixed(2)}${hidden ? ", hidden" : ""})`);
      }
    });
    return out;
  }, ignore);
}

export const SECTION_IDS = ["top", "about", "experience", "projects", "education", "leadership", "contact"];
