import { test, expect, scrollThrough, waitForReady, hiddenTextElements, revealHeader, SECTION_IDS } from "./fixtures";

const LEGIT_FADES = ["#top [data-hero-copy]", ".exp-pinned [data-exp-card]"];

test.describe("page load", () => {
  test("loads with no console errors or failed same-origin requests; title and description present", async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("requestfailed", (r) => {
      if (r.url().startsWith(baseURL!)) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
    });
    page.on("response", (r) => {
      if (r.url().startsWith(baseURL!) && r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
    });
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page);
    expect(errors).toEqual([]);
    await expect(page).toHaveTitle(/Luke Horton/);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect((desc ?? "").length).toBeGreaterThan(50);
  });
});

test.describe("navigation", () => {
  test("every section exists", async ({ page }) => {
    await page.goto("/");
    for (const id of SECTION_IDS) await expect(page.locator(`section#${id}`), id).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(/Luke\s+Horton/i, { useInnerText: true });
  });

  test("every nav anchor scrolls to its section (desktop nav)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "desktop nav only");
    await page.goto("/");
    await waitForReady(page);
    const links = page.locator('header nav ul a[href^="#"]');
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of hrefs) {
      await revealHeader(page);
      await page.locator(`header nav ul a[href="${href}"]`).click();
      await expect
        .poll(
          () =>
            page.evaluate((h) => {
              const r = document.querySelector(h)!.getBoundingClientRect();
              return r.top < window.innerHeight * 0.5 && r.bottom > 100;
            }, href),
          { message: `section ${href} in view`, timeout: 15_000 },
        )
        .toBe(true);
      await expect(page.locator(href)).toBeVisible();
    }
  });

  test("mobile menu opens and navigates", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await page.goto("/");
    await waitForReady(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toHaveCSS("opacity", "1");
    for (const [label, id] of [["Experience", "experience"], ["Contact", "contact"]]) {
      if (!(await menu.isVisible()) || (await menu.getAttribute("aria-hidden")) === "true") {
        await revealHeader(page);
        await page.getByRole("button", { name: "Open menu" }).click();
      }
      await expect(menu.getByRole("link", { name: label })).toBeVisible();
      await menu.getByRole("link", { name: label }).click();
      await expect
        .poll(() => page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top < window.innerHeight * 0.5, id), { timeout: 15_000 })
        .toBe(true);
      await expect(menu).toHaveAttribute("aria-hidden", "true");
    }
  });
});

test.describe("reveals", () => {
  test("all text is visible after scrolling the full page", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page);
    await expect.poll(() => hiddenTextElements(page, LEGIT_FADES), { timeout: 10_000 }).toEqual([]);
  });

  test("reduced motion: all content visible without scrolling", async ({ browser, baseURL }) => {
    const { blockThirdParty } = await import("./fixtures");
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    await blockThirdParty(context, baseURL!);
    const page = await context.newPage();
    await page.goto(baseURL!);
    await waitForReady(page);
    await expect(page.locator("h1")).toBeVisible();
    expect(await hiddenTextElements(page, [])).toEqual([]);
    await context.close();
  });
});

test.describe("resilience", () => {
  test.describe("JavaScript disabled", () => {
    test.use({ javaScriptEnabled: false });
    test("h1 and every section's text are visible", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toHaveText(/Luke\s+Horton/i, { useInnerText: true });
      // The hero intro is a CSS-only animation that ends visible; poll until it has.
      await expect(page.locator("h1")).toHaveCSS("opacity", "1", { timeout: 3_000 });
      await expect(page.locator("h1")).toHaveCSS("visibility", "visible");
      await expect
        .poll(() => hiddenTextElements(page, []), { timeout: 3_000, message: "all text visible after the CSS intro" })
        .toEqual([]);
      for (const id of SECTION_IDS) {
        const text = await page.locator(`section#${id}`).innerText();
        expect(text.trim().length, `section #${id} has text`).toBeGreaterThan(5);
      }
    });
  });

  test("JS enabled but the Next bundle fails to load: content visible within 4s", async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js(\?.*)?$/, (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveText(/Luke\s+Horton/i, { useInnerText: true });
    await expect
      .poll(() => hiddenTextElements(page, []), { timeout: 4_000, message: "text visible without bundle" })
      .toEqual([]);
    await expect(page.locator("h1")).toHaveCSS("opacity", "1", { timeout: 4_000 });
  });
});

test.describe("layout", () => {
  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page);
    const m = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth);
    expect(m.bodyScrollWidth).toBeLessThanOrEqual(m.innerWidth);
  });
});
