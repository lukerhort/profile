import type { Page } from "@playwright/test";
import { test, expect, scrollThrough, waitForReady } from "./fixtures";
import { site, skills, projects, experience } from "../lib/content";

const NUMBERED = ["about", "experience", "projects", "education", "contact"];
/** Scroll effects are only live once Motion has run; scrolling before then is not what a visitor does. */
const motionReady = (page: Page) => page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

test.describe("contact", () => {
  test("email is fully visible and not clipped", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    const row = page.locator('#contact a[href^="mailto:"]');
    await scrollThrough(page);
    await row.scrollIntoViewIfNeeded();
    const value = row.locator(".display");
    await expect(value).toHaveText(site.email, { useInnerText: true });
    await expect(value).toBeVisible();
    await expect(page.locator("#contact ul")).toHaveCSS("opacity", "1");
    const m = await value.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = new Set(Array.from(range.getClientRects()).map((q) => Math.round(q.top))).size;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        ellipsis: cs.textOverflow === "ellipsis",
        lineHeightRatio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
        left: r.left,
        right: r.right,
        vw: window.innerWidth,
        lines,
      };
    });
    expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
    expect(m.scrollHeight).toBeLessThanOrEqual(m.clientHeight + 1);
    expect(m.ellipsis).toBe(false);
    expect(m.lineHeightRatio, "line-height leaves room for descenders").toBeGreaterThanOrEqual(1.1);
    expect(m.left).toBeGreaterThanOrEqual(0);
    expect(m.right).toBeLessThanOrEqual(m.vw);
    expect(m.lines, "address on a single line").toBe(1);
  });

  test("hovering a row wipes in the accent fill and shows TX READY", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "hover is a desktop interaction");
    await page.goto("/");
    await waitForReady(page);
    const row = page.locator("#contact ul a").nth(1);
    await scrollThrough(page);
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect
      .poll(() => row.locator(".contact-fill").evaluate((el) => getComputedStyle(el).transform))
      .toBe("matrix(1, 0, 0, 1, 0, 0)");
    await expect(row.locator(".contact-tx")).toHaveText(/TX ready/i);
    // Even with the arrow nudged, it stays inside the row's rule.
    await page.waitForTimeout(700);
    const [a, r] = await Promise.all([row.locator(".contact-arrow").boundingBox(), row.boundingBox()]);
    expect(a!.x + a!.width).toBeLessThanOrEqual(r!.x + r!.width);
  });
});

test.describe("section numbering", () => {
  test("HUD number matches the section's own eyebrow number", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "HUD is desktop only");
    await page.goto("/");
    await waitForReady(page);
    const hud = page.locator("[data-section-hud] [data-hud-index]");
    for (const id of NUMBERED) {
      const eyebrow = (await page.locator(`section#${id} .eyebrow .text-accent`).first().textContent())!.trim();
      await page.evaluate((i) => {
        const el = document.getElementById(i)!;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 2);
      }, id);
      await expect.poll(() => hud.textContent(), { message: `HUD number while at #${id}`, timeout: 5_000 }).toBe(eyebrow);
    }
  });

  test("section eyebrow numbers run 01..05 in page order", async ({ page }) => {
    await page.goto("/");
    const nums = await page.evaluate(
      (ids) => ids.map((i) => document.querySelector(`section#${i} .eyebrow .text-accent`)!.textContent!.trim()),
      NUMBERED,
    );
    expect(nums).toEqual(["01", "02", "03", "04", "05"]);
  });
});

test.describe("skills schematic", () => {
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  const offsets = (page: Page) =>
    page.locator("#education [data-drop]").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).strokeDashoffset)));

  test("every skill is rendered and visible", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page);
    const panel = page.locator("#education .schematic");
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveCSS("opacity", "1");
    for (const g of skills) {
      await expect(panel.getByRole("heading", { name: g.group })).toBeVisible();
      for (const item of g.items) {
        await expect(
          panel.locator(".chip").filter({ hasText: new RegExp(`^${escapeRe(item)}$`) }),
          `${g.group}: ${item}`,
        ).toBeVisible();
      }
    }
    await expect(panel.locator(".chip")).toHaveCount(total);
  });

  test("traces end fully drawn after scrolling in", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await motionReady(page);
    await page.locator("#education .schematic").scrollIntoViewIfNeeded();
    await expect.poll(() => offsets(page), { timeout: 8_000 }).toEqual(skills.map(() => 0));
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("traces are drawn immediately", async ({ page }) => {
      await page.goto("/");
      await waitForReady(page);
      expect(await offsets(page)).toEqual(skills.map(() => 0));
    });
  });

  test.describe("JavaScript disabled", () => {
    test.use({ javaScriptEnabled: false });
    test("skills and drawn traces are in the markup", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#education .chip")).toHaveCount(total);
      expect(await offsets(page)).toEqual(skills.map(() => 0));
    });
  });
});

test.describe("mobile menu", () => {
  test("overlay is opaque: the hero name does not show through", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await page.goto("/");
    await waitForReady(page);
    await page.waitForTimeout(1600); // hero intro
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toHaveCSS("opacity", "1");
    await expect(menu).toHaveCSS("background-color", /^rgb\(\d+, \d+, \d+\)$/); // no alpha channel
    await expect(menu.getByRole("link", { name: "Contact" })).toBeVisible();
    const hit = await page.evaluate(() => {
      const r = document.querySelector("h1")!.getBoundingClientRect();
      const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
      const y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
      const el = document.elementFromPoint(x, y);
      return { inMenu: !!el?.closest("#mobile-menu, header"), tag: el?.tagName, y, h1Top: r.top };
    });
    expect(hit.inMenu, JSON.stringify(hit)).toBe(true);
  });
});

test.describe("visual stability", () => {
  test("nothing in main extends beyond the viewport width", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page);
    const offenders = await page.evaluate(() => {
      const vw = window.innerWidth;
      // Decorative layers (orbit rings, parallax images) may overflow their own
      // clipping ancestor as long as that ancestor fits within the viewport.
      const clipped = (el: Element) => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const cs = getComputedStyle(n);
          const r = n.getBoundingClientRect();
          if ((cs.overflowX !== "visible" || cs.overflow !== "visible") && r.left >= -0.5 && r.right <= vw + 0.5) return true;
        }
        return false;
      };
      const out: string[] = [];
      document.querySelectorAll("main *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if ((r.right > vw + 0.5 || r.left < -0.5) && !clipped(el)) {
          out.push(`${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
        }
      });
      return out.slice(0, 15);
    });
    expect(offenders).toEqual([]);
  });
});

test.describe("keyboard", () => {
  /** Tab through the page until every element matching `selector` has been focused; returns outline info per element. */
  async function tabThrough(page: Page, selector: string) {
    const count = await page.evaluate((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => el.setAttribute("data-kb", String(i)));
      return document.querySelectorAll("[data-kb]").length;
    }, selector);
    const seen = new Map<string, { style: string; width: number }>();
    let wraps = 0;
    for (let i = 0; i < 200 && seen.size < count && wraps < 2; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return { kb: null, wrapped: true, style: "", width: 0 };
        const cs = getComputedStyle(el);
        return { kb: el.getAttribute("data-kb"), wrapped: false, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
      });
      if (f.wrapped) wraps++;
      if (f.kb) seen.set(f.kb, { style: f.style, width: f.width });
    }
    return { count, seen };
  }

  test("Tab reaches every hero button with a visible focus outline", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await page.waitForTimeout(1600);
    const { count, seen } = await tabThrough(page, "#top a.btn-line");
    expect(count).toBeGreaterThanOrEqual(2);
    expect(seen.size, "hero buttons reached by Tab").toBe(count);
    const noOutline = [...seen].filter(([, v]) => v.style === "none" || v.width < 1);
    expect(noOutline, "focused without a visible outline").toEqual([]);
  });

  // KNOWN FAILURE (not in this agent's files): Motion.tsx hides every [data-reveal] with
  // GSAP autoAlpha (visibility:hidden) until it scrolls into view, and Tab does not scroll,
  // so below-the-fold controls (gallery thumbnails, contact rows) are unreachable by keyboard
  // until revealed by mouse/wheel. Remove test.fail() once Motion reveals on focus.
  test("Tab reaches project gallery thumbnails with a visible focus outline", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await page.waitForTimeout(1600);
    const { count, seen } = await tabThrough(page, '#projects ul[aria-label$="images"] button');
    expect(count).toBeGreaterThanOrEqual(3);
    expect(seen.size, "gallery thumbnails reached by Tab").toBe(count);
    const noOutline = [...seen].filter(([, v]) => v.style === "none" || v.width < 1);
    expect(noOutline, "focused without a visible outline").toEqual([]);
  });
});

test.describe("content", () => {
  test("the hero is the name, the job title and nothing inflated", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(/Luke\s*Horton/i);
    await expect(page.locator("#top")).toContainText(site.title);
    await expect(page.locator("#top")).toContainText(site.tagline);
  });

  test("the current role names the real work: interfaces, ICDs, I/O allocation, Altium", async ({ page }) => {
    await page.goto("/");
    const text = experience[0].body.join(" ");
    for (const word of ["RS-422", "Ethernet", "CAN", "interface control documents", "I/O allocation", "block diagrams", "Altium"]) {
      expect(text, word).toContain(word);
    }
    await expect(page.locator("#experience")).toContainText("RS-422, Ethernet and CAN", { useInnerText: false });
  });

  test("ATLAS leads the projects; Daedalus is paused and does not claim a flight", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('#projects [data-testid="project-card"]');
    await expect(cards.first().locator("h3")).toHaveText(/atlas/i);
    const daedalus = cards.filter({ hasText: /daedalus/i });
    await expect(daedalus).toContainText(/status:\s*paused/i);
    await expect(daedalus).toContainText("has not flown");
    const d = projects.find((p) => p.name === "Daedalus")!;
    const copy = [d.summary, ...d.details, ...d.stats].join(" ");
    expect(copy).not.toMatch(/L1|Level 1|certif|50\+|apogee|hardware-in-the-loop|HITL/i);
    const page_text = await page.locator("body").innerText();
    expect(page_text).not.toMatch(/Level 1|L1 certified/i);
  });

  test("a project without a website shows no dead link", async ({ page }) => {
    await page.goto("/");
    const atlas = page.locator('#projects [data-testid="project-card"]').first();
    await expect(atlas.getByRole("link")).toHaveCount(0);
  });

  test("non-space roles are one short list, and the Leadership section is gone", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#leadership")).toHaveCount(0);
    for (const id of ["top", "about", "experience", "projects", "contact"]) {
      await expect(page.locator(`#${id}`)).not.toContainText(/Kappa Alpha|DMG/);
    }
    await expect(page.locator("#education")).toContainText("Kappa Alpha Order");
  });

  test("every resume link says how old the PDF is", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="hero-cta-resume"]')).toContainText(site.resumeDate);
    await expect(page.locator(`#contact a[href="${site.resume}"]`)).toContainText(site.resumeDate);
  });

  test("the program name is not on the page", async ({ page }) => {
    await page.goto("/");
    expect(await page.content()).not.toMatch(/\bSBI\b|interceptor/i);
  });
});
